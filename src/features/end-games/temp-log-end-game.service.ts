import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { TempLogEndGames, TempLogEndGamesDocument } from './schemas';

@Injectable()
export class TempLogEndGameService {
    constructor(
        @InjectModel(TempLogEndGames.name) private readonly model: Model<TempLogEndGamesDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) { }

    async deleteAll(): Promise<Result<TempLogEndGames[]>> {
        return this.dataHandler.deleteMany(this.model, {});
    }

    async insertMany(data: TempLogEndGames[]): Promise<Result<TempLogEndGames[]>> {
        return this.dataHandler.insertMany(this.model, data);
    }

    async syncToPromotionBet() {
        console.log('[syncToPromotionBet] Starting synchronization of temp logs to promotion bets');
        console.log('[syncToPromotionBet] Building aggregation pipeline');

        const query = [
            {
                $lookup: {
                    from: 'usersessions',
                    let: {
                        playerId: '$playerId',
                        operatorId: '$operatorId',
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
                    operatorId: '$operatorId',
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

        console.log('[syncToPromotionBet] Pipeline steps:');
        console.log('[syncToPromotionBet] Step 1: Lookup user sessions for player and operator IDs');

        // Create a sample pipeline to log data after step 1
        const step1Pipeline = [...query.slice(0, 1)];
        this.model.aggregate(step1Pipeline).exec().then(data => {
            console.log(`[syncToPromotionBet] Step 1 data sample (${data.length} records):`,
                data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No records');
        }).catch(err => console.error('[syncToPromotionBet] Error logging step 1 data:', err));

        console.log('[syncToPromotionBet] Step 2: Project fields and extract session data');

        // Create a sample pipeline to log data after step 2
        const step2Pipeline = [...query.slice(0, 2)];
        this.model.aggregate(step2Pipeline).exec().then(data => {
            console.log(`[syncToPromotionBet] Step 2 data sample (${data.length} records):`,
                data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No records');
        }).catch(err => console.error('[syncToPromotionBet] Error logging step 2 data:', err));

        console.log('[syncToPromotionBet] Step 3: Filter out records with disableAward flag');

        // Create a sample pipeline to log data after step 3
        const step3Pipeline = [...query.slice(0, 3)];
        this.model.aggregate(step3Pipeline).exec().then(data => {
            console.log(`[syncToPromotionBet] Step 3 data sample (${data.length} records):`,
                data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No records');
        }).catch(err => console.error('[syncToPromotionBet] Error logging step 3 data:', err));

        console.log('[syncToPromotionBet] Step 4: Lookup user info to get player nicknames');

        // Create a sample pipeline to log data after step 4
        const step4Pipeline = [...query.slice(0, 4)];
        this.model.aggregate(step4Pipeline).exec().then(data => {
            console.log(`[syncToPromotionBet] Step 4 data sample (${data.length} records):`,
                data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No records');
        }).catch(err => console.error('[syncToPromotionBet] Error logging step 4 data:', err));

        console.log('[syncToPromotionBet] Step 5: Final projection with all required promotion bet fields');

        // Create a sample pipeline to log data after step 5
        const step5Pipeline = [...query.slice(0, 5)];
        this.model.aggregate(step5Pipeline).exec().then(data => {
            console.log(`[syncToPromotionBet] Step 5 data sample (${data.length} records):`,
                data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No records');
        }).catch(err => console.error('[syncToPromotionBet] Error logging step 5 data:', err));

        console.log('[syncToPromotionBet] Step 6: Merge results into promotion_bets collection');

        console.log('[syncToPromotionBet] Executing aggregation pipeline with lookup to usersessions and userinfos');
        const execution = this.model.aggregate(query).exec();
        console.log('[syncToPromotionBet] Aggregation pipeline executed, processing results');

        const result = await this.dataHandler.getData(execution);
        console.log(`[syncToPromotionBet] Synchronization completed, affected documents: ${result?.data || 0}`);

        return result;
    }
}
