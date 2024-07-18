import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class LeaderBoardService {
    constructor(
        @InjectModel(PromotionLeaderBoards.name) private readonly model: Model<PromotionLeaderBoardsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async getLeaderBoard(promotionId: string): Promise<Result<PromotionLeaderBoards[]>> {
        const execution = this.model.find({ promotionId }).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async getTopLeaderBoard(promotionId: number, limit: number): Promise<Result<PromotionLeaderBoards[]>> {
        const execution = this.model.find({ promotionId }).sort({ pointInBaseCurrency: -1 }).limit(limit).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async updateAwardAmount(leaderBoard: PromotionLeaderBoards, amount: number): Promise<Result<PromotionLeaderBoards>> {
        const filter = { promotionId: leaderBoard.promotionId, operatorId: leaderBoard.operatorId, playerId: leaderBoard.playerId };
        const updates = { awardedAmount: amount, updatedTime: new Date() };

        return this.dataHandler.updateData(this.model, filter, updates);
    }

    async getLatestDataSourceTimeStamp(promotionId: number): Promise<Date> {
        const execution = this.model.findOne({ promotionId }).sort({ dataSourceTimeStamp: -1 }).lean().exec();
        return (await this.dataHandler.getData(execution))?.data?.dataSourceTimeStamp;
    }

    async upsert(data: PromotionLeaderBoards): Promise<Result<PromotionLeaderBoards>> {
        const filter = { promotionId: data.promotionId, operatorId: data.operatorId, playerId: data.playerId };
        const existingItemIncrement: any = { point: data.point, pointInBaseCurrency: data.pointInBaseCurrency };
        const newData = {
            promotionId: data.promotionId,
            operatorId: data.operatorId,
            playerId: data.playerId,
            siteName: data.siteName,
            currencyGroupId: data.currencyGroupId,
            currency: data.currency,
            updatedTime: new Date(),
            nickName: data.nickName,
        };

        return this.dataHandler.updateData(
            this.model,
            filter,
            { $inc: existingItemIncrement as any, $setOnInsert: newData, $set: { dataSourceTimeStamp: data.dataSourceTimeStamp } },
            { upsert: true, setDefaultsOnInsert: true },
        );
    }
}
