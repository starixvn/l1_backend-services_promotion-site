import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { UserSession } from '../users/schemas';
import { LeaderBoardItemViewModel, LeaderBoardViewModel } from './models/leader-board-response';
import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from './schemas';

@Injectable()
export class LeaderBoardService {
    constructor(
        @InjectModel(PromotionLeaderBoards.name) private readonly model: Model<PromotionLeaderBoardsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async getLeaderBoard(promotionId: number, userSession: UserSession): Promise<LeaderBoardViewModel> {
        return new LeaderBoardViewModel(
            await this.getTop10LeaderBoardByCurrencyId(promotionId, userSession.currencyGroupId),
            await this.getUserLeaderBoard(promotionId, userSession),
        );
    }

    private async getTop10LeaderBoardByCurrencyId(promotionId: number, currencyGroupId: string): Promise<LeaderBoardItemViewModel[]> {
        const top10 = await this.model.find({ promotionId, currencyGroupId }).sort({ pointInBaseCurrency: -1 }).limit(10).lean().exec();
        const result: LeaderBoardItemViewModel[] = [];
        top10.forEach((playerLeaderBoard) => {
            result.push(new LeaderBoardItemViewModel(playerLeaderBoard.nickName, playerLeaderBoard.point));
        });
        return result;
    }

    private async getUserLeaderBoard(
        promotionId: number,
        userSession: UserSession,
    ): Promise<
        LeaderBoardItemViewModel & {
            rank: number;
        }
    > {
        const currentUser = await this.model.findOne({ promotionId, playerId: userSession.playerId }).lean().exec();
        if (!currentUser) {
            return { rank: 0, ...new LeaderBoardItemViewModel('you', 0) };
        }
        const rankBeforeUser = await this.model
            .find({
                promotionId,
                currencyGroupId: userSession.currencyGroupId,
                pointInBaseCurrency: { $gt: currentUser.pointInBaseCurrency },
            })
            .sort({ pointInBaseCurrency: -1 })
            .lean()
            .count()
            .exec();
        return { rank: rankBeforeUser + 1, ...new LeaderBoardItemViewModel('you', currentUser.point) };
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
