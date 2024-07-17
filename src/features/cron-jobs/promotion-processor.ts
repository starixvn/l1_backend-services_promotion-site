import { Inject } from '@nestjs/common';
import { PromotionBetService } from '../promotion-bets/promotion-bet.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { LeaderBoardService } from '../promotion-leader-boards/leader-board.service';
import { PromotionRunService } from '../promotion-runs/promotion-run.service';
import { PromotionRuns } from '../promotion-runs/schemas';
import { CurrencyGroup, Operator, PROMOTION_STATUSES, PromotionConfigs } from '../promotion-configs/schemas';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { ExchangeRates } from '../exchange-rates/schemas';
import { GameConfigService } from '../game-configs/game-config.service';
import { GameConfigs, SLOT_GAME_TYPES } from '../game-configs/schemas';
import { PromotionBets } from '../promotion-bets/schemas';
import { PromotionLeaderBoards } from '../promotion-leader-boards/schemas';
import { SentryLogger } from '../../_shared/common/providers';
import { InjectModel } from '@nestjs/mongoose';
import { TicketSilos, TicketSilosDocument } from '../ticket-silos/schemas';
import { Model, Schema } from 'mongoose';

export class PromotionProcessor {
    constructor(
        @Inject(SentryLogger) private readonly logger: SentryLogger,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(LeaderBoardService) private readonly leaderBoardService: LeaderBoardService,
        @Inject(PromotionRunService) private readonly promotionRunService: PromotionRunService,
        @Inject(PromotionBetService) private readonly promotionBetService: PromotionBetService,
        @Inject(ExchangeRateService) private readonly exchangeRateService: ExchangeRateService,
        @Inject(GameConfigService) private readonly gameConfigService: GameConfigService,
    ) {}

    async proceed() {
        try {
            console.log('proceed');
            await this.promotionBetService.syncEndGameLog();
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
        return JSON.parse(promotionRunResult.data.promotionConfigs) as PromotionConfigs;
    }

    async processRunningPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        const exchangeRate = await this.exchangeRateService.getAll();
        const gameConfigs = await this.gameConfigService.getAll();
        for (const promotion of result.data) {
            try {
                await this.processRunningPromotion(promotion, gameConfigs.data, exchangeRate.data);
            } catch (e) {
                this.logger.error(e);
            }
        }
    }

    async processRunningPromotion(promotion: PromotionConfigs, gameConfigs: GameConfigs[], exchangeRate: ExchangeRates) {
        const promotionConfig = await this.getSealedPromotionConfig(promotion);
        const latestDataSourceTimeStamp = await this.leaderBoardService.getLatestDataSourceTimeStamp(promotionConfig.promotionId);
        const ticketResult = await this.promotionBetService.getBets(
            new Date(promotionConfig.startDateTime),
            new Date(promotionConfig.endDateTime),
            latestDataSourceTimeStamp,
        );

        for (const operator of promotionConfig.operators) {
            for (const currencyGroup of operator.currencyGroups) {
                if (currencyGroup.enabled) {
                    for (const ticket of ticketResult.data) {
                        await this.processTicket(promotion.promotionId, gameConfigs, operator, currencyGroup, ticket, exchangeRate);
                    }
                }
            }
        }
    }

    async processTicket(
        promotionId: number,
        gameConfigs: GameConfigs[],
        operator: Operator,
        currencyGroup: CurrencyGroup,
        ticket: PromotionBets,
        exchangeRate: ExchangeRates,
    ) {
        if (
            currencyGroup.currencyGroupId === ticket.currencyGroupId &&
            ticket.totalWin > ticket.totalAmount &&
            this.isValidMinBet(gameConfigs, currencyGroup, ticket) &&
            !this.isSiteNameExcluded(operator.excludedSiteNames, ticket.siteName)
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
            leaderBoard.nickName = ticket.nickname;

            console.log('leaderBoard', leaderBoard);
            await this.leaderBoardService.upsert(leaderBoard); // todo: write in batch
        }
    }

    isSiteNameExcluded(excludedSiteNames: string, siteName: string) {
        return excludedSiteNames.replace(' ', '').split(',').includes(siteName);
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
