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
    ) {
        console.log('[PromotionProcessor] Initialized');
    }

    async proceed() {
        try {
            console.log('[PromotionProcessor] Starting promotion processing cycle at', new Date().toISOString());
            const startTime = new Date();

            console.log('[PromotionProcessor] Syncing end game logs...');
            await this.promotionBetService.syncEndGameLog();

            console.log('[PromotionProcessor] Processing new promotions...');
            await this.processNewPromotions();

            console.log('[PromotionProcessor] Processing running promotions...');
            await this.processRunningPromotions();

            console.log('[PromotionProcessor] Processing finished promotions...');
            await this.processFinishedPromotions();

            const duration = (new Date().getTime() - startTime.getTime()) / 1000;
            console.log(`[PromotionProcessor] Completed processing cycle in ${duration} seconds`);
            console.log(`[PromotionProcessor] Start: ${startTime.toISOString()}, End: ${new Date().toISOString()}`);
        } catch (errors) {
            console.log('[PromotionProcessor] Error in processing cycle:', errors);
            this.logger.error(errors);
        }
    }

    async processNewPromotions() {
        console.log('[ProcessNewPromotions] Fetching promotions with NEW status');
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.new);
        console.log(`[ProcessNewPromotions] Found ${result.data.length} new promotions`);

        const currentTime = getCurrentTime();
        console.log(`[ProcessNewPromotions] Current time: ${currentTime.toISOString()}`);

        for (const promotionConfig of result.data) {
            console.log(`[ProcessNewPromotions] Checking promotion ID: ${promotionConfig.promotionId}, Name: ${promotionConfig.name}`);
            console.log(`[ProcessNewPromotions] Start time: ${new Date(promotionConfig.startDateTime).toISOString()}, End time: ${new Date(promotionConfig.endDateTime).toISOString()}`);

            if (promotionConfig.startDateTime <= currentTime && currentTime <= promotionConfig.endDateTime) {
                console.log(`[ProcessNewPromotions] Promotion ID: ${promotionConfig.promotionId} is now active and will be started`);

                const newPromotionRun = new PromotionRuns();
                newPromotionRun.promotionId = promotionConfig.promotionId;
                newPromotionRun.latestRunTime = currentTime;
                newPromotionRun.promotionConfigs = JSON.stringify(promotionConfig);

                console.log(`[ProcessNewPromotions] Creating promotion run for ID: ${promotionConfig.promotionId}`);
                await this.promotionRunService.create(newPromotionRun);

                console.log(`[ProcessNewPromotions] Updating promotion status to RUNNING for ID: ${promotionConfig.promotionId}`);
                await this.promotionConfigService.updatePromotionStatus(promotionConfig.promotionId, PROMOTION_STATUSES.running);

                console.log(`[ProcessNewPromotions] Sending start notification for promotion ID: ${promotionConfig.promotionId}`);
                await this.chatBotService.sendMessage(
                    process.env.PROMOTION_CONVERSATION_ID,
                    formatStartNotification(promotionConfig.name, promotionConfig.startDateTime, promotionConfig.endDateTime),
                );
                console.log(`[ProcessNewPromotions] Promotion ID: ${promotionConfig.promotionId} successfully started`);
            } else {
                console.log(`[ProcessNewPromotions] Promotion ID: ${promotionConfig.promotionId} not yet active or already expired`);
            }
        }
    }

    async processFinishedPromotions() {
        console.log('[ProcessFinishedPromotions] Fetching promotions with RUNNING status');
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        console.log(`[ProcessFinishedPromotions] Found ${result.data.length} running promotions to check for completion`);

        for (const promotionConfig of result.data) {
            try {
                console.log(`[ProcessFinishedPromotions] Checking if promotion ID: ${promotionConfig.promotionId} has finished`);
                const sealedPromotionConfig = await this.getSealedPromotionConfig(promotionConfig);
                const currentTime = getCurrentTime();
                const endTime = new Date(sealedPromotionConfig.endDateTime);

                console.log(`[ProcessFinishedPromotions] Promotion ID: ${promotionConfig.promotionId}, End time: ${endTime.toISOString()}, Current time: ${currentTime.toISOString()}`);

                if (endTime < currentTime) {
                    console.log(`[ProcessFinishedPromotions] Promotion ID: ${promotionConfig.promotionId} has finished, processing completion tasks`);

                    console.log(`[ProcessFinishedPromotions] Updating awarded amounts for promotion ID: ${promotionConfig.promotionId}`);
                    await this.updateAwardedAmount(promotionConfig);

                    console.log(`[ProcessFinishedPromotions] Updating promotion status to COMPLETED for ID: ${promotionConfig.promotionId}`);
                    await this.promotionConfigService.updatePromotionStatus(promotionConfig.promotionId, PROMOTION_STATUSES.completed);

                    console.log(`[ProcessFinishedPromotions] Updating latest run time for promotion ID: ${promotionConfig.promotionId}`);
                    await this.promotionRunService.updateLatestRunTime(promotionConfig.promotionId);

                    console.log(`[ProcessFinishedPromotions] Updating checksum for promotion ID: ${promotionConfig.promotionId}`);
                    await this.updateChecksum(sealedPromotionConfig);

                    console.log(`[ProcessFinishedPromotions] Sending finish notification for promotion ID: ${promotionConfig.promotionId}`);
                    await this.chatBotService.sendMessage(
                        process.env.PROMOTION_CONVERSATION_ID,
                        formatFinishNotification(promotionConfig.name, promotionConfig.startDateTime, promotionConfig.endDateTime),
                    );
                    console.log(`[ProcessFinishedPromotions] Promotion ID: ${promotionConfig.promotionId} has been successfully completed`);
                } else {
                    console.log(`[ProcessFinishedPromotions] Promotion ID: ${promotionConfig.promotionId} is still running`);
                }
            } catch (e) {
                console.log(`[ProcessFinishedPromotions] Error processing promotion ID: ${promotionConfig.promotionId}`, e);
                this.logger.error(e);
            }
        }
    }

    async updateAwardedAmount(promotionConfigs: PromotionConfigs) {
        console.log(`[UpdateAwardedAmount] Updating awarded amounts for promotion ID: ${promotionConfigs.promotionId}`);

        const awards = getAwards(promotionConfigs);
        console.log(`[UpdateAwardedAmount] Award values: ${JSON.stringify(awards)}`);

        console.log(`[UpdateAwardedAmount] Fetching exchange rates for ID: ${promotionConfigs.exId}`);
        const exchangeRate = await this.exchangeRateService.getExchangeRateById(promotionConfigs.exId);

        console.log(`[UpdateAwardedAmount] Getting top ${awards.length} leaders for promotion ID: ${promotionConfigs.promotionId}`);
        const topLeaderBoard = await this.leaderBoardService.getTopLeaderBoard(promotionConfigs.promotionId, awards.length);
        console.log(`[UpdateAwardedAmount] Retrieved ${topLeaderBoard.data.length} leaderboard entries`);

        for (let i = 0; i < topLeaderBoard.data.length; i++) {
            const leaderBoard = topLeaderBoard.data[i];
            console.log(`[UpdateAwardedAmount] Processing rank ${i + 1}: Player ID: ${leaderBoard.playerId}, Operator: ${leaderBoard.operatorId}`);

            const awardedInPlayerCurrency = convertWinningAmountToPlayerCurrency(
                awards[i],
                leaderBoard.currencyCode,
                leaderBoard.multiplier,
                exchangeRate.data,
            );

            console.log(`[UpdateAwardedAmount] Award for rank ${i + 1}: Base award: ${awards[i]}, In player currency: ${awardedInPlayerCurrency}`);
            const roundedAward = roundNumber(awards[i], 0);
            console.log(`[UpdateAwardedAmount] Updating award amount for player ID: ${leaderBoard.playerId}, Amount: ${roundedAward}, In player currency: ${awardedInPlayerCurrency}`);

            await this.leaderBoardService.updateAwardAmount(leaderBoard, roundedAward, awardedInPlayerCurrency);
        }

        console.log(`[UpdateAwardedAmount] Completed updating award amounts for promotion ID: ${promotionConfigs.promotionId}`);
    }

    async getSealedPromotionConfig(sourcePromotionConfigs: PromotionConfigs) {
        console.log(`[GetSealedPromotionConfig] Getting sealed config for promotion ID: ${sourcePromotionConfigs.promotionId}`);

        const promotionRunResult = await this.promotionRunService.getByPromotionId(sourcePromotionConfigs.promotionId);
        console.log(`[GetSealedPromotionConfig] Found promotion run data for ID: ${sourcePromotionConfigs.promotionId}`);

        const config = JSON.parse(promotionRunResult.data.promotionConfigs) as PromotionConfigs;
        console.log(`[GetSealedPromotionConfig] Parsed config for promotion ID: ${config.promotionId}, Name: ${config.name}`);

        return config;
    }

    async processRunningPromotions() {
        console.log('[ProcessRunningPromotions] Fetching promotions with RUNNING status');
        const result = await this.promotionConfigService.getPromotionsByStatus(PROMOTION_STATUSES.running);
        console.log(`[ProcessRunningPromotions] Found ${result.data.length} running promotions`);

        console.log('[ProcessRunningPromotions] Fetching all game configs');
        const gameConfigs = await this.gameConfigService.getAll();
        console.log(`[ProcessRunningPromotions] Retrieved ${gameConfigs.data.length} game configs`);

        for (const promotion of result.data) {
            try {
                console.log(`[ProcessRunningPromotions] Processing promotion ID: ${promotion.promotionId}, Name: ${promotion.name}`);

                console.log(`[ProcessRunningPromotions] Fetching exchange rates for ID: ${promotion.exId}`);
                const exchangeRate = await this.exchangeRateService.getExchangeRateById(promotion.exId);

                console.log(`[ProcessRunningPromotions] Processing running promotion ID: ${promotion.promotionId}`);
                await this.processRunningPromotion(promotion, gameConfigs.data, exchangeRate.data);

                console.log(`[ProcessRunningPromotions] Updating latest run time for promotion ID: ${promotion.promotionId}`);
                await this.promotionRunService.updateLatestRunTime(promotion.promotionId);

                console.log(`[ProcessRunningPromotions] Completed processing promotion ID: ${promotion.promotionId}`);
            } catch (e) {
                console.log(`[ProcessRunningPromotions] Error processing promotion ID: ${promotion.promotionId}`, e);
                this.logger.error(e);
            }
        }
    }

    async processRunningPromotion(promotion: PromotionConfigs, gameConfigs: GameConfigs[], exchangeRate: ExchangeRates) {
        console.log(`[ProcessRunningPromotion] Processing promotion ID: ${promotion.promotionId}, Name: ${promotion.name}`);

        console.log(`[ProcessRunningPromotion] Getting sealed config for promotion ID: ${promotion.promotionId}`);
        const promotionConfig = await this.getSealedPromotionConfig(promotion);

        console.log(`[ProcessRunningPromotion] Getting latest data source timestamp for promotion ID: ${promotion.promotionId}`);
        const latestDataSourceTimeStamp = await this.leaderBoardService.getLatestDataSourceTimeStamp(promotionConfig.promotionId);
        console.log(`[ProcessRunningPromotion] Latest data source timestamp: ${latestDataSourceTimeStamp?.toISOString() || 'not found'}`);

        console.log(`[ProcessRunningPromotion] Fetching bets for promotion ID: ${promotion.promotionId}`);
        const betResult = await this.promotionBetService.getBets(
            new Date(promotionConfig.startDateTime),
            new Date(promotionConfig.endDateTime),
            latestDataSourceTimeStamp,
        );

        console.log(`[ProcessRunningPromotion] Retrieved ${betResult.data.length} bets for promotion ID: ${promotion.promotionId} at ${new Date().toISOString()}`);

        console.log(`[ProcessRunningPromotion] Generating currency group configs for promotion ID: ${promotion.promotionId}`);
        const configsByCurrencyGroup = getConfigsByCurrencyGroup(promotionConfig);
        console.log(`[ProcessRunningPromotion] Generated ${Object.keys(configsByCurrencyGroup).length} currency group configs`);

        console.log(`[ProcessRunningPromotion] Processing ${betResult.data.length} bets for promotion ID: ${promotion.promotionId}`);
        const leaderBoardsObj: { [key: string]: PromotionLeaderBoards } = {};
        let validBets = 0;
        let invalidBets = 0;
        for (const bet of betResult.data) {
            console.log(`[ProcessRunningPromotion] Processing bet for player ${bet.playerId}, game ${bet.gameId}, amount ${bet.totalAmount}`);
            const leaderBoard = this.processBet(promotion.promotionId, gameConfigs, configsByCurrencyGroup, bet, exchangeRate);
            if (leaderBoard) {
                validBets++;
                const key = `${leaderBoard.promotionId}_${leaderBoard.operatorId}_${leaderBoard.playerId}`;
                console.log(`[ProcessRunningPromotion] Valid bet found, using key: ${key}`);
                if (leaderBoardsObj[key]) {
                    console.log(`[ProcessRunningPromotion] Updating existing leaderboard entry for ${key}`);
                    console.log(`[ProcessRunningPromotion] Current points: ${leaderBoardsObj[key].point}, adding: ${leaderBoard.point}`);
                    leaderBoardsObj[key].point = roundNumber(leaderBoardsObj[key].point + leaderBoard.point);
                    leaderBoardsObj[key].pointInBaseCurrency = roundNumber(
                        leaderBoardsObj[key].pointInBaseCurrency + leaderBoard.pointInBaseCurrency,
                    );
                    console.log(`[ProcessRunningPromotion] Updated points: ${leaderBoardsObj[key].point}, in base currency: ${leaderBoardsObj[key].pointInBaseCurrency}`);
                    leaderBoardsObj[key].dataSourceTimeStamp = leaderBoard.dataSourceTimeStamp;
                } else {
                    console.log(`[ProcessRunningPromotion] Creating new leaderboard entry for ${key} with points: ${leaderBoard.point}`);
                    leaderBoardsObj[key] = leaderBoard;
                }
            } else {
                invalidBets++;
                console.log(`[ProcessRunningPromotion] Invalid bet for player ${bet.playerId}, game ${bet.gameId}, skipping`);
            }
        }

        console.log(`[ProcessRunningPromotion] Processed ${betResult.data.length} bets for promotion ID: ${promotion.promotionId}: Valid: ${validBets}, Invalid: ${invalidBets}`);

        console.log(`[ProcessRunningPromotion] Sorting leaderboards for promotion ID: ${promotion.promotionId}`);
        const sortedLeaderBoards = sortLeaderBoards(leaderBoardsObj);
        console.log(`[ProcessRunningPromotion] Writing ${sortedLeaderBoards.length} leaderboard entries to database`);

        await this.leaderBoardService.bulkWrite(sortedLeaderBoards);
        console.log(`[ProcessRunningPromotion] Completed processing promotion ID: ${promotion.promotionId}`);
    }

    processBet(
        promotionId: number,
        gameConfigs: GameConfigs[],
        configsByCurrencyGroup: { [key: string]: ConfigByCurrencyGroup },
        bet: PromotionBets,
        exchangeRate: ExchangeRates,
    ) {
        // Using debug level logging here to avoid excessive logs for each bet
        const isValid = isValidBet(configsByCurrencyGroup, bet, gameConfigs);
        console.log(`[ProcessBet] Bet validation for promotionId: ${promotionId}, playerId: ${bet.playerId}, gameId: ${bet.gameId}, valid: ${isValid}`);

        if (isValid) {
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

            console.log(`[ProcessBet] Created leaderboard entry: promotionId: ${promotionId}, playerId: ${bet.playerId}, points: ${leaderBoard.point}, pointsInBaseCurrency: ${leaderBoard.pointInBaseCurrency}`);
            return leaderBoard;
        }

        return null;
    }

    async updateChecksum(promotionConfig: PromotionConfigs) {
        console.log(`[UpdateChecksum] Starting checksum update for promotion ID: ${promotionConfig.promotionId}`);

        console.log(`[UpdateChecksum] Fetching game configs for promotion ID: ${promotionConfig.promotionId}`);
        const gameConfigs = await this.gameConfigService.getAll();
        console.log(`[UpdateChecksum] Retrieved ${gameConfigs.data.length} game configs`);

        console.log(`[UpdateChecksum] Generating currency group configs for promotion ID: ${promotionConfig.promotionId}`);
        const configsByCurrencyGroup = getConfigsByCurrencyGroup(promotionConfig);

        console.log(`[UpdateChecksum] Getting top 10 leaderboard entries for promotion ID: ${promotionConfig.promotionId}`);
        const topLeaderBoard = await this.leaderBoardService.getTopLeaderBoardWithTestCurrency(promotionConfig.promotionId, 10);
        console.log(`[UpdateChecksum] Retrieved ${topLeaderBoard.data.length} leaderboard entries`);

        for (const leaderBoard of topLeaderBoard.data) {
            console.log(`[UpdateChecksum] Processing checksum for player ID: ${leaderBoard.playerId}, Operator: ${leaderBoard.operatorId}`);

            console.log(`[UpdateChecksum] Fetching bets for player ID: ${leaderBoard.playerId}, Operator: ${leaderBoard.operatorId}`);
            const betResult = await this.promotionBetService.getBetsByPlayer(
                new Date(promotionConfig.startDateTime),
                new Date(promotionConfig.endDateTime),
                leaderBoard.operatorId,
                leaderBoard.playerId,
            );
            console.log(`[UpdateChecksum] Retrieved ${betResult.data.length} bets for player`);

            let checksumPoint = 0;
            let validBets = 0;

            for (const bet of betResult.data) {
                if (isValidBet(configsByCurrencyGroup, bet, gameConfigs.data)) {
                    const point = calculatePoint(bet);
                    checksumPoint += point;
                    validBets++;
                    console.log(`[UpdateChecksum] Valid bet for player ID: ${leaderBoard.playerId}, Points: ${point}, Running Total: ${checksumPoint}`);
                }
            }

            console.log(`[UpdateChecksum] Final checksum for player ID: ${leaderBoard.playerId}: ${checksumPoint} from ${validBets} valid bets out of ${betResult.data.length} total bets`);
            await this.leaderBoardService.updateChecksumPoint(leaderBoard, checksumPoint);
        }

        console.log(`[UpdateChecksum] Completed checksum update for promotion ID: ${promotionConfig.promotionId}`);
    }
}
