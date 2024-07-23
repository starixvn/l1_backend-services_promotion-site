import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { UserSession } from '../users/schemas';
import { LeaderBoardItemViewModel, LeaderBoardViewModel, topUserRank, you } from './models/leader-board-response';
import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from './schemas';

@Injectable()
export class LeaderBoardService {
    constructor(
        @InjectModel(PromotionLeaderBoards.name) private readonly model: Model<PromotionLeaderBoardsDocument>,
        @Inject(ExchangeRateService) private readonly exchangeRateService: ExchangeRateService,

        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async getLeaderBoard(promotionId: number, session: UserSession): Promise<LeaderBoardViewModel> {
        return new LeaderBoardViewModel(
            await this.getTopLeaderBoardByPromotionId(promotionId, session, topUserRank),
            await this.getPlayerLeaderBoardByPromotionId(promotionId, session),
        );
    }

    private async getTopLeaderBoardByPromotionId(promotionId: number, session, top: number = 10): Promise<LeaderBoardItemViewModel[]> {
        const topLeaderBoard = await this.model
            .find({ promotionId, isTestCurrency: false })
            .sort({ pointInBaseCurrency: -1 })
            .limit(top)
            .lean()
            .exec();

        const exchangeRate = (await this.exchangeRateService.getAll()).data;
        const convertValueToUserCurrency = (value: number) => value / exchangeRate.code[session.currencyCode] / session.multiplier;

        const leaderBoardItems: LeaderBoardItemViewModel[] = [];
        topLeaderBoard.forEach((playerLeaderBoard) => {
            leaderBoardItems.push(
                new LeaderBoardItemViewModel(playerLeaderBoard.nickName, convertValueToUserCurrency(playerLeaderBoard.pointInBaseCurrency)),
            );
        });
        return leaderBoardItems;
    }

    private async getPlayerLeaderBoardByPromotionId(
        promotionId: number,
        session: UserSession,
    ): Promise<
        LeaderBoardItemViewModel & {
            rank: number;
        }
    > {
        const playerLeaderBoard = await this.model.findOne({ promotionId, playerId: session.playerId }).lean().exec();
        if (!playerLeaderBoard) {
            return { rank: 0, ...new LeaderBoardItemViewModel(you, 0) };
        }
        const rankBeforeUser = await this.model
            .find({
                promotionId,
                pointInBaseCurrency: { $gt: playerLeaderBoard.pointInBaseCurrency },
            })
            .sort({ pointInBaseCurrency: -1 })
            .lean()
            .count()
            .exec();
        const rank = !playerLeaderBoard.isTestCurrency ? rankBeforeUser + 1 : 0;
        return { rank, ...new LeaderBoardItemViewModel(you, playerLeaderBoard.point) };
    }

    async getTopLeaderBoard(promotionId: number, limit: number): Promise<Result<PromotionLeaderBoards[]>> {
        const execution = this.model
            .find({ promotionId, isTestCurrency: false })
            .sort({ pointInBaseCurrency: -1, dataSourceTimeStamp: 1 })
            .limit(limit)
            .lean()
            .exec();
        return this.dataHandler.getData(execution);
    }

    async getTopLeaderBoardWithTestCurrency(promotionId: number, limit: number): Promise<Result<PromotionLeaderBoards[]>> {
        const execution = this.model
            .find({ promotionId })
            .sort({ pointInBaseCurrency: -1, dataSourceTimeStamp: 1 })
            .limit(limit)
            .lean()
            .exec();
        return this.dataHandler.getData(execution);
    }

    async updateAwardAmount(
        leaderBoard: PromotionLeaderBoards,
        amount: number,
        awardedInPlayerCurrency: number,
    ): Promise<Result<PromotionLeaderBoards>> {
        const filter = { promotionId: leaderBoard.promotionId, operatorId: leaderBoard.operatorId, playerId: leaderBoard.playerId };
        const updates = { awardedAmountInBaseCurrency: amount, awardedAmount: awardedInPlayerCurrency, updatedTime: new Date() };

        return this.dataHandler.updateData(this.model, filter, updates);
    }

    async updateChecksumPoint(leaderBoard: PromotionLeaderBoards, checksumPoint: number): Promise<Result<PromotionLeaderBoards>> {
        const filter = { promotionId: leaderBoard.promotionId, operatorId: leaderBoard.operatorId, playerId: leaderBoard.playerId };
        const updates = { checksumPoint, updatedTime: new Date() };

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
            currencyCode: data.currencyCode,
            updatedTime: new Date(),
            nickName: data.nickName,
            siteId: data.siteId,
            playerName: data.playerName,
            multiplier: data.multiplier,
        };

        return this.dataHandler.updateData(
            this.model,
            filter,
            {
                $inc: existingItemIncrement as any,
                $setOnInsert: newData,
                $set: { dataSourceTimeStamp: data.dataSourceTimeStamp, isTestCurrency: data.isTestCurrency },
            },
            { upsert: true, setDefaultsOnInsert: true },
        );
    }
}
