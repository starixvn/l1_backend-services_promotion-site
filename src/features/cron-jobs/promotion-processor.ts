import { Inject } from '@nestjs/common';
import { PromotionBetService } from '../promotion-bets/promotion-bet.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { LeaderBoardService } from '../promotion-leader-boards/leader-board.service';
import { PromotionRunService } from '../promotion-runs/promotion-run.service';
import { TicketSiloService } from '../ticket-silos/ticket-silo.service';
import { PromotionRuns } from '../promotion-runs/schemas';
import { CurrencyGroup, PROMOTION_STATUSES, PromotionConfigs } from '../promotion-configs/schemas';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { ExchangeRates } from '../exchange-rates/schemas';
import { GameConfigService } from '../game-configs/game-config.service';
import { GameConfigs, SLOT_GAME_TYPES } from '../game-configs/schemas';
import { PromotionBets } from '../promotion-bets/schemas';
import { PromotionLeaderBoards } from '../promotion-leader-boards/schemas';
import { UserClientService } from '../users/services/user-client.service';
import { SentryLogger } from '../../_shared/common/providers';

export class PromotionProcessor {
    constructor(
        @Inject(SentryLogger) private readonly logger: SentryLogger,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(TicketSiloService) private readonly ticketSiloService: TicketSiloService,
        @Inject(UserClientService) private readonly userSessionService: UserClientService,
        @Inject(LeaderBoardService) private readonly leaderBoardService: LeaderBoardService,
        @Inject(PromotionRunService) private readonly promotionRunService: PromotionRunService,
        @Inject(PromotionBetService) private readonly promotionBetService: PromotionBetService,
        @Inject(ExchangeRateService) private readonly exchangeRateService: ExchangeRateService,
        @Inject(GameConfigService) private readonly gameConfigService: GameConfigService,
    ) {}

    async proceed() {
        try {
            await this.processNewPromotions();
            await this.processRunningPromotions();
            await this.processFinishedPromotions();
        } catch (errors) {
            console.log(errors);
            this.logger.error(errors);
        }
    }

    async processNewPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.new);
        const currentTime = this.getCurrentTime();
        for (const promotionConfig of result.data) {
            if (promotionConfig.startDateTime <= currentTime && currentTime <= promotionConfig.endDateTime) {
                const newPromotionRun = new PromotionRuns();
                newPromotionRun.promotionId = promotionConfig.promotionId;
                newPromotionRun.isJobRunning = false;
                newPromotionRun.latestRunTime = new Date();
                newPromotionRun.promotionBetPosition = {};
                newPromotionRun.promotionLeaderBoardPosition = {};
                newPromotionRun.updatedTime = new Date();
                newPromotionRun.promotionConfigs = JSON.stringify(promotionConfig);

                await this.promotionRunService.create(newPromotionRun);
                await this.promotionConfigService.updatePromotionStatus(promotionConfig.promotionId, PROMOTION_STATUSES.running);
            }
        }
    }

    async processFinishedPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        const currentTime = this.getCurrentTime();
        for (const promotionConfig of result.data) {
            if (promotionConfig.endDateTime < currentTime) {
                await this.promotionConfigService.updatePromotionStatus(promotionConfig.promotionId, PROMOTION_STATUSES.finished);
            }
        }
    }

    async getSealedPromotionConfig(sourcePromotionConfigs: PromotionConfigs) {
        const promotionRunResult = await this.promotionRunService.getByPromotionId(sourcePromotionConfigs.promotionId);
        const promotionConfig = JSON.parse(promotionRunResult.data.promotionConfigs) as PromotionConfigs;
        return promotionConfig;
    }

    async processRunningPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        const exchangeRate = await this.exchangeRateService.getAll();
        const gameConfigs = await this.gameConfigService.getAll();
        for (const promotion of result.data) {
            const promotionConfig = await this.getSealedPromotionConfig(promotion);
            const latestDataSourceTimeStamp = await this.leaderBoardService.getLatestDataSourceTimeStamp(promotionConfig.promotionId);
            const ticketResult = await this.promotionBetService.getBets(
                new Date(promotionConfig.startDateTime),
                new Date(promotionConfig.endDateTime),
                latestDataSourceTimeStamp,
            );

            const leaderBoards = [];
            for (const operator of promotionConfig.operators) {
                for (const currencyGroup of operator.currencyGroups) {
                    if (currencyGroup.enabled) {
                        for (const ticket of ticketResult.data) {
                            this.processTicket(
                                leaderBoards,
                                promotion.promotionId,
                                gameConfigs.data,
                                currencyGroup,
                                ticket,
                                exchangeRate.data,
                            );
                        }
                    }
                }
            }

            for (const leaderBoard of leaderBoards) {
                await this.leaderBoardService.upsert(leaderBoard);
            }
        }
    }

    processTicket(
        leaderBoards: PromotionLeaderBoards[],
        promotionId: number,
        gameConfigs: GameConfigs[],
        currencyGroup: CurrencyGroup,
        ticket: PromotionBets,
        exchangeRate: ExchangeRates,
    ) {
        if (
            currencyGroup.currencyGroupId === ticket.currencyGroupId &&
            ticket.totalWin > ticket.totalAmount &&
            this.isValidMinBet(gameConfigs, currencyGroup, ticket)
        ) {
            const leaderBoard = new PromotionLeaderBoards();
            leaderBoard.promotionId = promotionId;
            leaderBoard.playerId = ticket.playerId;
            leaderBoard.operatorId = ticket.operatorId;
            leaderBoard.siteName = ticket.siteName;
            leaderBoard.currencyGroupId = ticket.currencyGroupId;
            leaderBoard.currency = ticket.currency;
            leaderBoard.point = (ticket.totalWin - ticket.totalAmount) / 100;
            leaderBoard.pointInBaseCurrency = leaderBoard.point * exchangeRate.code[ticket.currency] * ticket.multiplier;
            leaderBoard.dataSourceTimeStamp = ticket.dataSourceTimeStamp;

            leaderBoards.push(leaderBoard);
        }
    }

    isValidMinBet(gameConfigs: GameConfigs[], currencyGroup: CurrencyGroup, ticket: PromotionBets) {
        const gameType = gameConfigs.find((config) => config.gameId === ticket.gameId)?.type;
        const minBet = SLOT_GAME_TYPES.includes(gameType) ? currencyGroup.slotGameMinBet : currencyGroup.otherGameMinBet;
        return ticket.totalAmount >= minBet;
    }

    getCurrentTime() {
        return new Date();
    }
}
