import { Inject } from '@nestjs/common';
import { PromotionBetService } from '../promotion-bets/promotion-bet.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { LeaderBoardService } from '../promotion-leader-boards/leader-board.service';
import { PromotionRunService } from '../promotion-runs/promotion-run.service';
import { PromotionRuns } from '../promotion-runs/schemas';
import { ConfigByCurrencyGroup, PROMOTION_STATUSES, PromotionConfigs } from '../promotion-configs/schemas';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { ExchangeRates } from '../exchange-rates/schemas';
import { GameConfigService } from '../game-configs/game-config.service';
import { GameConfigs } from '../game-configs/schemas';
import { PromotionBets } from '../promotion-bets/schemas';
import { PromotionLeaderBoards } from '../promotion-leader-boards/schemas';
import { SentryLogger } from '../../_shared/common/providers';
import {
    calculatePoint,
    calculatePointInBaseCurrency,
    convertWinningAmountToPlayerCurrency,
    formatFinishNotification,
    formatStartNotification,
    getAwards,
    getConfigsByCurrencyGroup,
    getCurrentTime,
    isValidBet,
    roundNumber,
    sortLeaderBoards,
} from './promotion-functions';
import { ChatBotService } from '../chat-bots/chat-bot-service';

export class PromotionProcessor {
    constructor(
        @Inject(SentryLogger) private readonly logger: SentryLogger,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(LeaderBoardService) private readonly leaderBoardService: LeaderBoardService,
        @Inject(PromotionRunService) private readonly promotionRunService: PromotionRunService,
        @Inject(PromotionBetService) private readonly promotionBetService: PromotionBetService,
        @Inject(ExchangeRateService) private readonly exchangeRateService: ExchangeRateService,
        @Inject(GameConfigService) private readonly gameConfigService: GameConfigService,
        @Inject(ChatBotService) private readonly chatBotService: ChatBotService,
    ) { }

    async proceed() {
        try {
            console.log('proceed', new Date().toISOString());
            const startTime = new Date();
            await this.promotionBetService.syncEndGameLog();
            await this.processNewPromotions();
            await this.processRunningPromotions();
            await this.processFinishedPromotions();
            console.log('proceeded in ', (new Date().getTime() - startTime.getTime()) / 1000, startTime, new Date());
        } catch (errors) {
            console.log(errors);
            this.logger.error(errors);
        }
    }

    async processNewPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.new);
        const currentTime = getCurrentTime();
        for (const promotionConfig of result.data) {
            if (promotionConfig.startDateTime <= currentTime && currentTime <= promotionConfig.endDateTime) {
                const newPromotionRun = new PromotionRuns();
                newPromotionRun.promotionId = promotionConfig.promotionId;
                newPromotionRun.latestRunTime = currentTime;
                newPromotionRun.promotionConfigs = JSON.stringify(promotionConfig);

                await this.promotionRunService.create(newPromotionRun);
                await this.promotionConfigService.updatePromotionStatus(promotionConfig.promotionId, PROMOTION_STATUSES.running);
                await this.chatBotService.sendMessage(
                    process.env.PROMOTION_CONVERSATION_ID,
                    formatStartNotification(promotionConfig.name, promotionConfig.startDateTime, promotionConfig.endDateTime),
                );
            }
        }
    }

    async processFinishedPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        for (const promotionConfig of result.data) {
            try {
                const sealedPromotionConfig = await this.getSealedPromotionConfig(promotionConfig);
                if (new Date(sealedPromotionConfig.endDateTime) < getCurrentTime()) {
                    await this.updateAwardedAmount(promotionConfig);
                    await this.promotionConfigService.updatePromotionStatus(promotionConfig.promotionId, PROMOTION_STATUSES.completed);
                    await this.promotionRunService.updateLatestRunTime(promotionConfig.promotionId);
                    await this.updateChecksum(sealedPromotionConfig);
                    await this.chatBotService.sendMessage(
                        process.env.PROMOTION_CONVERSATION_ID,
                        formatFinishNotification(promotionConfig.name, promotionConfig.startDateTime, promotionConfig.endDateTime),
                    );
                }
            } catch (e) {
                this.logger.error(e);
            }
        }
    }

    async updateAwardedAmount(promotionConfigs: PromotionConfigs) {
        const awards = getAwards(promotionConfigs);
        const exchangeRate = await this.exchangeRateService.getExchangeRateById(promotionConfigs.exId);
        const topLeaderBoard = await this.leaderBoardService.getTopLeaderBoard(promotionConfigs.promotionId, awards.length);
        for (let i = 0; i < topLeaderBoard.data.length; i++) {
            const leaderBoard = topLeaderBoard.data[i];
            const awardedInPlayerCurrency = convertWinningAmountToPlayerCurrency(
                awards[i],
                leaderBoard.currencyCode,
                leaderBoard.multiplier,
                exchangeRate.data,
            );
            this.leaderBoardService.updateAwardAmount(leaderBoard, roundNumber(awards[i], 0), awardedInPlayerCurrency);
        }
    }

    async getSealedPromotionConfig(sourcePromotionConfigs: PromotionConfigs) {
        const promotionRunResult = await this.promotionRunService.getByPromotionId(sourcePromotionConfigs.promotionId);
        return JSON.parse(promotionRunResult.data.promotionConfigs) as PromotionConfigs;
    }

    async processRunningPromotions() {
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);

        const gameConfigs = await this.gameConfigService.getAll();
        for (const promotion of result.data) {
            try {
                const exchangeRate = await this.exchangeRateService.getExchangeRateById(promotion.exId);
                await this.processRunningPromotion(promotion, gameConfigs.data, exchangeRate.data);
                await this.promotionRunService.updateLatestRunTime(promotion.promotionId);
            } catch (e) {
                this.logger.error(e);
            }
        }
    }

    async processRunningPromotion(promotion: PromotionConfigs, gameConfigs: GameConfigs[], exchangeRate: ExchangeRates) {
        const promotionConfig = await this.getSealedPromotionConfig(promotion);
        const latestDataSourceTimeStamp = await this.leaderBoardService.getLatestDataSourceTimeStamp(promotionConfig.promotionId);
        const betResult = await this.promotionBetService.getBets(
            new Date(promotionConfig.startDateTime),
            new Date(promotionConfig.endDateTime),
            latestDataSourceTimeStamp,
        );

        console.log('-> bets', betResult.data.length, new Date().toISOString());
        const configsByCurrencyGroup = getConfigsByCurrencyGroup(promotionConfig);
        const leaderBoardsObj: { [key: string]: PromotionLeaderBoards } = {};
        for (const bet of betResult.data) {
            const leaderBoard = this.processBet(promotion.promotionId, gameConfigs, configsByCurrencyGroup, bet, exchangeRate);
            if (leaderBoard) {
                const key = `${leaderBoard.promotionId}_${leaderBoard.operatorId}_${leaderBoard.playerId}`;
                if (leaderBoardsObj[key]) {
                    leaderBoardsObj[key].point = roundNumber(leaderBoardsObj[key].point + leaderBoard.point);
                    leaderBoardsObj[key].pointInBaseCurrency = roundNumber(
                        leaderBoardsObj[key].pointInBaseCurrency + leaderBoard.pointInBaseCurrency,
                    );
                    leaderBoardsObj[key].dataSourceTimeStamp = leaderBoard.dataSourceTimeStamp;
                } else {
                    leaderBoardsObj[key] = leaderBoard;
                }
            }
        }

        await this.leaderBoardService.bulkWrite(sortLeaderBoards(leaderBoardsObj));
    }

    processBet(
        promotionId: number,
        gameConfigs: GameConfigs[],
        configsByCurrencyGroup: { [key: string]: ConfigByCurrencyGroup },
        bet: PromotionBets,
        exchangeRate: ExchangeRates,
    ) {
        if (isValidBet(configsByCurrencyGroup, bet, gameConfigs)) {
            const leaderBoard = new PromotionLeaderBoards();
            leaderBoard.promotionId = promotionId;
            leaderBoard.playerId = bet.playerId;
            leaderBoard.operatorId = bet.operatorId;
            leaderBoard.siteName = bet.siteName;
            leaderBoard.currencyGroupId = bet.currencyGroupId;
            leaderBoard.currency = bet.currencyName;
            leaderBoard.point = calculatePoint(bet);
            leaderBoard.pointInBaseCurrency = calculatePointInBaseCurrency(exchangeRate, bet);
            leaderBoard.dataSourceTimeStamp = bet.dataSourceTimeStamp;
            leaderBoard.nickName = bet.nickname;
            leaderBoard.siteId = bet.siteId;
            leaderBoard.playerName = bet.playerName;
            leaderBoard.isTestCurrency = bet.isTestCurrency;
            leaderBoard.currencyCode = bet.currencyCode;
            leaderBoard.multiplier = bet.multiplier;
            leaderBoard.updatedTime = new Date();

            return leaderBoard;
        }

        return null;
    }

    async updateChecksum(promotionConfig: PromotionConfigs) {
        const gameConfigs = await this.gameConfigService.getAll();
        const configsByCurrencyGroup = getConfigsByCurrencyGroup(promotionConfig);
        const topLeaderBoard = await this.leaderBoardService.getTopLeaderBoardWithTestCurrency(promotionConfig.promotionId, 10);
        for (const leaderBoard of topLeaderBoard.data) {
            const betResult = await this.promotionBetService.getBetsByPlayer(
                new Date(promotionConfig.startDateTime),
                new Date(promotionConfig.endDateTime),
                leaderBoard.operatorId,
                leaderBoard.playerId,
            );

            let checksumPoint = 0;
            for (const bet of betResult.data) {
                if (isValidBet(configsByCurrencyGroup, bet, gameConfigs.data)) {
                    checksumPoint += calculatePoint(bet);
                }
            }

            await this.leaderBoardService.updateChecksumPoint(leaderBoard, checksumPoint);
        }
    }
}
