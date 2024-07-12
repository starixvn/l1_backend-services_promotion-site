import { Inject } from '@nestjs/common';
import { PromotionBetService } from '../promotion-bets/promotion-bet.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { LeaderBoardService } from '../promotion-leader-boards/leader-board.service';
import { PromotionRunService } from '../promotion-runs/promotion-run.service';
import { TicketSiloService } from '../ticket-silos/ticket-silo.service';
import { UserSessionsService } from '../users/services/user-session.service';
import { PromotionRuns } from '../promotion-runs/schemas';
import { CurrencyGroup, Operator, PROMOTION_STATUSES, PromotionConfigs } from '../promotion-configs/schemas';
import { TicketSilos } from '../ticket-silos/schemas';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { ExchangeRates } from '../exchange-rates/schemas';
import LeaderBoard from 'views/leader-board';
import { PromotionLeaderBoards } from '../promotion-leader-boards/schemas';
import { GameConfigService } from '../game-configs/game-config.service';
import { GameConfigs } from '../game-configs/schemas';
import { SLOT_GAME_TYPES } from '../game-configs/schemas';

export class PromotionProcessor {
    constructor(
        //private readonly logger: SentryLogger,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(TicketSiloService) private readonly ticketSiloService: TicketSiloService,
        @Inject(UserSessionsService) private readonly userSessionService: UserSessionsService,
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
        } catch (errors) {
            console.log(errors);
        }
    }

    async processNewPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.new);
        const currentTime = new Date();
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
                await this.promotionConfigService.markPromotionRunning(promotionConfig.promotionId);
            }
        }
    }

    async processRunningPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        const exchangeRate = await this.exchangeRateService.getAll();
        const gameConfigs = await this.gameConfigService.getAll();
        const currentTime = new Date();
        for (const promotion of result.data) {
            const promotionRunResult = await this.promotionRunService.getByPromotionId(promotion.promotionId);
            const promotionConfig = JSON.parse(promotionRunResult.data.promotionConfigs) as PromotionConfigs;
            const ticketResult = await this.ticketSiloService.getTicketWithUserInfos(
                new Date(promotionConfig.startDateTime),
                new Date(promotionConfig.endDateTime),
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
                                operator,
                                currencyGroup,
                                ticket,
                                exchangeRate.data,
                            );
                        }
                    }
                }
            }

            // upinsert leader board
            console.log('leaderBoards', leaderBoards);
        }
    }

    processTicket(
        leaderBoards: PromotionLeaderBoards[],
        promotionId: number,
        gameConfigs: GameConfigs[],
        operator: Operator,
        currencyGroup: CurrencyGroup,
        ticket: TicketSilos,
        exchangeRate: ExchangeRates,
    ) {
        console.log(
            currencyGroup.enabled,
            operator.operatorId,
            operator.excludedSiteNames,
            currencyGroup.currencyGroupId,
            currencyGroup.slotGameMinBet,
            currencyGroup.otherGameMinBet,
        );
        if (
            currencyGroup.currencyGroupId === ticket.currencyGroupId &&
            ticket.payout > ticket.stake &&
            this.isValidMinBet(gameConfigs, currencyGroup, ticket)
        ) {
            const leaderBoard = new PromotionLeaderBoards();
            leaderBoard.promotionId = promotionId;
            leaderBoard.playerId = ticket.playerId;
            leaderBoard.operatorId = ticket.operatorId;
            leaderBoard.siteName = ticket.siteName;
            leaderBoard.currencyGroupId = ticket.currencyGroupId;
            leaderBoard.currency = ticket.currency;
            leaderBoard.point = (ticket.payout - ticket.stake) / 100;

            leaderBoards.push(leaderBoard);
        }
    }

    isValidMinBet(gameConfigs: GameConfigs[], currencyGroup: CurrencyGroup, ticket: TicketSilos) {
        const gameType = gameConfigs.find((config) => config.gameId === ticket.gameId)?.type;
        const minBet = SLOT_GAME_TYPES.includes(gameType) ? currencyGroup.slotGameMinBet : currencyGroup.otherGameMinBet;
        return ticket.stake >= minBet;
    }

    updatePromotionStatusSettled() {}
}
