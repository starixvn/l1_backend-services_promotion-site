import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Result } from '../../_shared/common/models/result';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { PROMOTION_STATUSES } from '../promotion-configs/schemas';
import { UserSession } from '../users/schemas';
import { LeaderBoardItemViewModel, LeaderBoardViewModel, topUserRank, you } from './models/leader-board-response';
import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from './schemas';

const RECALCULATE_SECRET = 'key3z4cjfn';

@Injectable()
export class LeaderBoardService {
    constructor(
        @InjectModel(PromotionLeaderBoards.name) private readonly model: Model<PromotionLeaderBoardsDocument>,
        @Inject(ExchangeRateService) private readonly exchangeRateService: ExchangeRateService,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
        @Inject(SentryLogger) private readonly logger: SentryLogger,
    ) { }

    async getLeaderBoard(promotionId: number, session: UserSession): Promise<LeaderBoardViewModel> {
        this.logger.log(`Getting leaderboard for promotionId: ${promotionId}, playerId: ${session.playerId}`);

        const result = new LeaderBoardViewModel(
            await this.getTopLeaderBoardByPromotionId(promotionId, session, topUserRank),
            await this.getPlayerLeaderBoardByPromotionId(promotionId, session),
        );

        this.logger.log(`Retrieved leaderboard for promotionId: ${promotionId}, playerId: ${session.playerId}`);
        return result;
    }

    async getTopLeaderBoardByPromotionId(promotionId: number, session, top = 10): Promise<LeaderBoardItemViewModel[]> {
        this.logger.log(`Getting top ${top} leaderboard items for promotionId: ${promotionId}`);

        const topLeaderBoard = await this.model
            .find({ promotionId, isTestCurrency: false })
            .sort({ pointInBaseCurrency: -1, dataSourceTimeStamp: 1 })
            .limit(top)
            .lean()
            .exec();

        this.logger.log(`Found ${topLeaderBoard.length} top leaderboard items for promotionId: ${promotionId}`);

        const promotionConfig = (await this.promotionConfigService.getByPromotionId(promotionId)).data;
        const exchangeRate = (await this.exchangeRateService.getExchangeRateById(promotionConfig.exId)).data;
        const convertValueToUserCurrency = (value: number) => value / exchangeRate.code[session.currencyCode] / session.multiplier;

        const leaderBoardItems: LeaderBoardItemViewModel[] = [];
        topLeaderBoard.forEach((playerLeaderBoard) => {
            leaderBoardItems.push(
                new LeaderBoardItemViewModel(playerLeaderBoard.nickName, convertValueToUserCurrency(playerLeaderBoard.pointInBaseCurrency)),
            );
        });

        return leaderBoardItems;
    }

    async getPlayerLeaderBoardByPromotionId(
        promotionId: number,
        session: UserSession,
    ): Promise<
        LeaderBoardItemViewModel & {
            rank: number;
        }
    > {
        this.logger.log(`Getting player leaderboard position for promotionId: ${promotionId}, playerId: ${session.playerId}`);

        const playerLeaderBoard = await this.model.findOne({ promotionId, playerId: session.playerId }).lean().exec();
        if (!playerLeaderBoard || playerLeaderBoard.isTestCurrency) {
            this.logger.log(`Player not found in leaderboard or has test currency - promotionId: ${promotionId}, playerId: ${session.playerId}`);
            return { rank: 0, ...new LeaderBoardItemViewModel(you, playerLeaderBoard?.point ?? 0) };
        }

        const rankBeforeUser = await this.model
            .find({
                promotionId,
                pointInBaseCurrency: { $gt: playerLeaderBoard.pointInBaseCurrency },
                isTestCurrency: false,
            })
            .sort({ pointInBaseCurrency: -1 })
            .lean()
            .count()
            .exec();
        const rank = rankBeforeUser + 1;

        this.logger.log(`Player rank is ${rank} with points ${playerLeaderBoard.point} for promotionId: ${promotionId}, playerId: ${session.playerId}`);
        return { rank, ...new LeaderBoardItemViewModel(you, playerLeaderBoard.point) };
    }

    async getTopLeaderBoard(promotionId: number, limit: number): Promise<Result<PromotionLeaderBoards[]>> {
        this.logger.log(`Getting top ${limit} leaderboard entries for promotionId: ${promotionId}`);

        const execution = this.model
            .find({ promotionId, isTestCurrency: false })
            .sort({ pointInBaseCurrency: -1, dataSourceTimeStamp: 1 })
            .limit(limit)
            .lean()
            .exec();

        const result = await this.dataHandler.getData(execution) as Result<PromotionLeaderBoards[]>;
        this.logger.log(`Retrieved ${result.data ? result.data.length : 0} leaderboard entries for promotionId: ${promotionId}`);
        return result;
    }

    async getTopLeaderBoardWithTestCurrency(promotionId: number, limit: number): Promise<Result<PromotionLeaderBoards[]>> {
        this.logger.log(`Getting top ${limit} leaderboard entries (including test currency) for promotionId: ${promotionId}`);

        const execution = this.model
            .find({ promotionId })
            .sort({ pointInBaseCurrency: -1, dataSourceTimeStamp: 1 })
            .limit(limit)
            .lean()
            .exec();

        const result = await this.dataHandler.getData(execution) as Result<PromotionLeaderBoards[]>;
        this.logger.log(`Retrieved ${result.data ? result.data.length : 0} leaderboard entries (including test currency) for promotionId: ${promotionId}`);
        return result;
    }

    async updateAwardAmount(
        leaderBoard: PromotionLeaderBoards,
        amount: number,
        awardedInPlayerCurrency: number,
    ): Promise<Result<PromotionLeaderBoards>> {
        this.logger.log(`Updating award amount for promotionId: ${leaderBoard.promotionId}, playerId: ${leaderBoard.playerId}, amount: ${amount}, inPlayerCurrency: ${awardedInPlayerCurrency}`);

        const filter = { promotionId: leaderBoard.promotionId, operatorId: leaderBoard.operatorId, playerId: leaderBoard.playerId };
        const updates = { awardedAmountInBaseCurrency: amount, awardedAmount: awardedInPlayerCurrency, updatedTime: new Date() };

        const result = await this.dataHandler.updateData(this.model, filter, updates) as Result<PromotionLeaderBoards>;
        this.logger.log(`Award amount update result: ${result.isSuccessful ? 'success' : 'failed'} for promotionId: ${leaderBoard.promotionId}, playerId: ${leaderBoard.playerId}`);
        return result;
    }

    async updateChecksumPoint(leaderBoard: PromotionLeaderBoards, checksumPoint: number): Promise<Result<PromotionLeaderBoards>> {
        this.logger.log(`Updating checksum point for promotionId: ${leaderBoard.promotionId}, playerId: ${leaderBoard.playerId}, checksumPoint: ${checksumPoint}`);

        const filter = { promotionId: leaderBoard.promotionId, operatorId: leaderBoard.operatorId, playerId: leaderBoard.playerId };
        const updates = { checksumPoint, updatedTime: new Date() };

        const result = await this.dataHandler.updateData(this.model, filter, updates) as Result<PromotionLeaderBoards>;
        this.logger.log(`Checksum point update result: ${result.isSuccessful ? 'success' : 'failed'} for promotionId: ${leaderBoard.promotionId}, playerId: ${leaderBoard.playerId}`);
        return result;
    }

    async getLatestDataSourceTimeStamp(promotionId: number): Promise<Date> {
        this.logger.log(`Getting latest data source timestamp for promotionId: ${promotionId}`);

        const execution = this.model.findOne({ promotionId }).sort({ dataSourceTimeStamp: -1 }).lean().exec();
        const data = await this.dataHandler.getData(execution);
        let result: Date = null;

        if (data?.data && typeof data.data === 'object' && 'dataSourceTimeStamp' in data.data) {
            result = data.data.dataSourceTimeStamp as Date;
        }

        this.logger.log(`Latest data source timestamp for promotionId ${promotionId}: ${result || 'not found'}`);
        return result;
    }

    async bulkWrite(leaderBoards: PromotionLeaderBoards[]): Promise<Result<any>> {
        const startTime = new Date();
        this.logger.log(`Starting bulkWrite operation for ${leaderBoards.length} leaderboard entries. Time: ${startTime.toISOString()}`);

        const operations = [];
        for (const data of leaderBoards) {
            const filter = {
                promotionId: data.promotionId,
                operatorId: data.operatorId,
                playerId: data.playerId,
                dataSourceTimeStamp: { $lt: data.dataSourceTimeStamp },
            };
            const existingItemIncrement: any = { point: data.point, pointInBaseCurrency: data.pointInBaseCurrency };
            const newData = {
                promotionId: data.promotionId,
                operatorId: data.operatorId,
                playerId: data.playerId,
                siteName: data.siteName,
                currencyGroupId: data.currencyGroupId,
                currency: data.currency,
                currencyCode: data.currencyCode,
                updatedTime: new Date(),
                nickName: data.nickName,
                siteId: data.siteId,
                playerName: data.playerName,
                multiplier: data.multiplier,
            };

            operations.push({
                updateOne: {
                    filter: filter,
                    update: {
                        $inc: existingItemIncrement,
                        $setOnInsert: newData,
                        $set: { dataSourceTimeStamp: data.dataSourceTimeStamp, isTestCurrency: data.isTestCurrency },
                    },
                    upsert: true,
                },
            });
        }

        const result = await this.dataHandler.bulkWrite(this.model, operations);
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        this.logger.log(`BulkWrite operation completed in ${duration}ms. Result: ${result.isSuccessful ? 'success' : 'failed'}. Time: ${endTime.toISOString()}`);
        if (result.data && result.data.upsertedCount) {
            this.logger.log(`BulkWrite stats - upserted: ${result.data.upsertedCount}, modified: ${result.data.modifiedCount}, matched: ${result.data.matchedCount}`);
        }

        return result;
    }

    async clearToRecalculate(promotionId: number, secret: string) {
        this.logger.log(`Attempting to clear leaderboard for recalculation for promotionId: ${promotionId}`);

        if (secret === RECALCULATE_SECRET) {
            const promotionConfig = (await this.promotionConfigService.getByPromotionId(promotionId)).data;

            if (!promotionConfig) {
                this.logger.warn(`Cannot clear leaderboard - promotion config not found for promotionId: ${promotionId}`);
                return;
            }

            if (promotionConfig.status !== PROMOTION_STATUSES.running) {
                this.logger.warn(`Cannot clear leaderboard - promotion not in running state for promotionId: ${promotionId}, status: ${promotionConfig.status}`);
                return;
            }

            const timeRemainingMinutes = (promotionConfig.endDateTime.getTime() - new Date().getTime()) / (1000 * 60);

            if (timeRemainingMinutes <= 10) {
                this.logger.warn(`Cannot clear leaderboard - less than 10 minutes remaining for promotionId: ${promotionId}, remaining: ${timeRemainingMinutes.toFixed(2)}mins`);
                return;
            }

            await this.dataHandler.deleteMany(this.model, { promotionId });
            this.logger.warn(`Successfully cleared leaderboard to recalculate for promotionId ${promotionId}`);
        } else {
            this.logger.warn(`Invalid recalculation secret provided for promotionId: ${promotionId}`);
        }
    }
}
