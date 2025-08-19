import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { DeleteResult } from 'mongodb';

import { Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { TempLogEndGames, TempLogEndGamesDocument } from './schemas';

@Injectable()
export class TempLogEndGameService {
    constructor(
        @InjectModel(TempLogEndGames.name) private readonly model: Model<TempLogEndGamesDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async deleteAll(): Promise<Result<DeleteResult>> {
        return this.dataHandler.deleteMany(this.model, {});
    }

    async insertMany(data: TempLogEndGames[]): Promise<Result<TempLogEndGames[]>> {
        return this.dataHandler.insertMany(this.model, data);
    }

    async syncToPromotionBet() {
        const operatorId = '$operatorId';

        const query = [
            {
                $lookup: {
                    from: 'usersessions',
                    let: {
                        playerId: '$playerId',
                        operatorId: operatorId,
                        siteId: '$siteId',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $cond: {
                                                if: { $eq: ['$$operatorId', 'SabaPlay'] },
                                                then: { $eq: ['$playerId', { $concat: ['$$siteId', '~', '$$playerId'] }] },
                                                else: { $eq: ['$playerId', '$$playerId'] }
                                            },
                                        },
                                        {
                                            $eq: [operatorId, '$$operatorId'],
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
                    operatorId: operatorId,
                    gameId: '$gameTypeId',
                    roundId: '$gameRoundId',
                    totalAmount: '$totalAmount',
                    totalWin: '$totalWin',
                    validBetAmount: '$validBetAmount',
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
                    disableAward: { $arrayElemAt: ['$result.disableAward', 0] },
                },
            },
            {
                $match: {
                    disableAward: false,
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
                    operatorId: operatorId,
                    gameId: '$gameId',
                    roundId: '$roundId',
                    totalAmount: '$totalAmount',
                    totalWin: '$totalWin',
                    validBetAmount: '$validBetAmount',
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

        const execution = this.model.aggregate(query as any).exec();
        return this.dataHandler.getData(execution);
    }
}
