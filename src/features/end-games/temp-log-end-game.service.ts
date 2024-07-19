import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';

import { TempLogEndGames, TempLogEndGamesDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class TempLogEndGameService {
    constructor(
        @InjectModel(TempLogEndGames.name) private readonly model: Model<TempLogEndGamesDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async deleteAll(): Promise<Result<TempLogEndGames[]>> {
        return this.dataHandler.deleteMany(this.model, {});
    }

    async insertMany(data: TempLogEndGames[]): Promise<Result<TempLogEndGames[]>> {
        return this.dataHandler.insertMany(this.model, data);
    }

    async syncToPromotionBet() {
        const query = [
            {
                $lookup: {
                    from: 'usersessions',
                    let: {
                        playerId: '$playerId',
                        operatorId: '$operatorId',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$playerId', '$$playerId'],
                                        },
                                        {
                                            $eq: ['$operatorId', '$$operatorId'],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $sort: { ssoTime: -1 },
                        },
                    ],
                    as: 'result',
                },
            },
            {
                $project: {
                    playerId: '$playerId',
                    operatorId: '$operatorId',
                    gameId: '$gameTypeId',
                    roundId: '$gameRoundId',
                    totalAmount: '$totalAmount',
                    totalWin: '$totalWin',
                    dataSourceId: '$logId',
                    dataSourceTimeStamp: '$logTimeStamp',
                    siteName: { $arrayElemAt: ['$result.siteName', 0] },
                    currencyGroupId: { $arrayElemAt: ['$result.currencyGroupId', 0] },
                    currencyCode: { $arrayElemAt: ['$result.currencyCode', 0] },
                    currencyName: { $arrayElemAt: ['$result.currencyName', 0] },
                    isTestCurrency: { $arrayElemAt: ['$result.isTestCurrency', 0] },
                    playerName: { $arrayElemAt: ['$result.playerName', 0] },
                    siteId: { $arrayElemAt: ['$result.siteId', 0] },
                    multiplier: { $arrayElemAt: ['$result.multiplier', 0] },
                    userId: { $arrayElemAt: ['$result.userId', 0] },
                },
            },
            {
                $lookup: {
                    from: 'userinfos',
                    localField: 'userId',
                    foreignField: 'id',
                    as: 'result',
                },
            },
            {
                $project: {
                    playerId: '$playerId',
                    operatorId: '$operatorId',
                    gameId: '$gameId',
                    roundId: '$roundId',
                    totalAmount: '$totalAmount',
                    totalWin: '$totalWin',
                    dataSourceId: '$dataSourceId',
                    dataSourceTimeStamp: '$dataSourceTimeStamp',
                    siteName: '$siteName',
                    currencyGroupId: '$currencyGroupId',
                    currencyCode: '$currencyCode',
                    currencyName: '$currencyName',
                    multiplier: '$multiplier',
                    isTestCurrency: '$isTestCurrency',
                    playerName: '$playerName',
                    siteId: '$siteId',
                    nickname: { $arrayElemAt: ['$result.name', 0] },
                    updatedTime: new Date(),
                },
            },
            {
                $merge: {
                    into: 'promotion_bets',
                    on: ['operatorId', 'playerId', 'gameId', 'roundId'],
                    whenMatched: 'merge',
                    whenNotMatched: 'insert',
                },
            },
        ];

        const execution = this.model.aggregate(query).exec();
        return this.dataHandler.getData(execution);
    }
}
