import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';

import { Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { END_GAMES_COLLECTION, EndGamesDocument, EndGamesSchema, LOG_DB, TempLogEndGames } from '../end-games/schemas';
import { TempLogEndGameService } from '../end-games/temp-log-end-game.service';
import { PromotionBets, PromotionBetsDocument } from './schemas';

@Injectable()
export class PromotionBetService {
    constructor(
        @InjectModel(PromotionBets.name) private readonly model: Model<PromotionBetsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
        @Inject(TempLogEndGameService) private readonly tempLogEndGameService: TempLogEndGameService,
    ) {
        console.log('PromotionBetService initialized');
    }

    async getBets(startTime: Date, endTime: Date, latestDataSourceTimeStamp: Date): Promise<Result<PromotionBets[]>> {
        console.log(`[GetBets] Fetching bets between ${startTime.toISOString()} and ${endTime.toISOString()}`);
        console.log(`[GetBets] Latest data source timestamp: ${latestDataSourceTimeStamp?.toISOString() || 'null'}`);

        const startDateTime = latestDataSourceTimeStamp && latestDataSourceTimeStamp > startTime ? latestDataSourceTimeStamp : startTime;
        console.log(`[GetBets] Using start time: ${startDateTime.toISOString()}`);

        const execution = this.model
            .find({
                dataSourceTimeStamp: { $gt: startDateTime, $lt: endTime },
            })
            .sort({ dataSourceTimeStamp: 1 })
            .lean()
            .exec();

        const result = await this.dataHandler.getData(execution) as Result<PromotionBets[]>;
        console.log(`[GetBets] Retrieved ${result.data ? result.data.length : 0} bets`);
        return result;
    }

    async getBetsByPlayer(startTime: Date, endTime: Date, operatorId: string, playerId: string): Promise<Result<PromotionBets[]>> {
        console.log(`[GetBetsByPlayer] Fetching bets for player ${playerId} (operatorId: ${operatorId})`);
        console.log(`[GetBetsByPlayer] Time range: ${startTime.toISOString()} to ${endTime.toISOString()}`);

        const execution = this.model
            .find({
                dataSourceTimeStamp: { $gt: startTime, $lt: endTime },
                operatorId,
                playerId,
            })
            .sort({ dataSourceTimeStamp: 1 })
            .lean()
            .exec();

        const result = await this.dataHandler.getData(execution) as Result<PromotionBets[]>;
        console.log(`[GetBetsByPlayer] Retrieved ${result.data ? result.data.length : 0} bets for player ${playerId}`);
        return result;
    }

    async getLatestDataSourceTimeStamp(): Promise<Date> {
        console.log('[GetLatestDataSourceTimeStamp] Fetching latest data source timestamp');

        const execution = this.model.findOne({}).sort({ dataSourceTimeStamp: -1 }).lean().exec();
        const data = await this.dataHandler.getData(execution);
        let result = null;

        if (data?.data && typeof data.data === 'object' && 'dataSourceTimeStamp' in data.data) {
            result = data.data.dataSourceTimeStamp;
        }

        console.log(`[GetLatestDataSourceTimeStamp] Latest timestamp: ${result?.toISOString() || 'not found'}`);
        return result;
    }

    async syncEndGameLog(): Promise<void> {
        console.log('[SyncEndGameLog] Starting end game log synchronization');
        const startTime = new Date();

        console.log('[SyncEndGameLog] Querying end game logs');
        const endGameLogs = await this.queryEndGameLog();
        console.log(`[SyncEndGameLog] Retrieved ${endGameLogs.length} end game logs`);

        console.log('[SyncEndGameLog] Filtering winning games and creating temp log items');
        const tempLogData = endGameLogs
            .filter((item) => +item.call.totalWin > +item.call.totalAmount)
            .map((item) => {
                return this.createTempLogItem(item);
            });
        console.log(`[SyncEndGameLog] Created ${tempLogData.length} temp log items from ${endGameLogs.length} end game logs`);

        console.log('[SyncEndGameLog] Deleting existing temp log data');
        await this.tempLogEndGameService.deleteAll();

        console.log(`[SyncEndGameLog] Inserting ${tempLogData.length} new temp log items`);
        await this.tempLogEndGameService.insertMany(tempLogData);

        console.log('[SyncEndGameLog] Syncing temp logs to promotion bets');
        await this.tempLogEndGameService.syncToPromotionBet();

        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        console.log(`[SyncEndGameLog] Completed in ${duration}ms at ${endTime.toISOString()}`);
    }

    async queryEndGameLog(): Promise<LeanDocument<EndGamesDocument>[]> {
        console.log('[QueryEndGameLog] Starting end game log query');

        const latestDataSourceTimeStamp = await this.getLatestDataSourceTimeStamp();
        const queryTime = latestDataSourceTimeStamp ? latestDataSourceTimeStamp : new Date(new Date().setDate(new Date().getDate() - 1));
        console.log(`[QueryEndGameLog] Using query time: ${queryTime.toISOString()}`);

        console.log(`[QueryEndGameLog] Connecting to log database: ${LOG_DB}`);
        const logDB = this.model.db.useDb(LOG_DB);
        const endGameModel = logDB.model<EndGamesDocument>(END_GAMES_COLLECTION, EndGamesSchema as any);

        console.log(`[QueryEndGameLog] Executing query with filter logTimeStamp > ${queryTime.toISOString()}`);
        const execution = endGameModel
            .find({ logTimeStamp: { $gt: queryTime.toISOString() } })
            .lean()
            .exec();

        const endGameLogs = await this.dataHandler.getData(execution);
        const logsData = endGameLogs.data as LeanDocument<EndGamesDocument>[];
        console.log(`[QueryEndGameLog] Retrieved ${logsData ? logsData.length : 0} end game logs`);

        if (!logsData || !Array.isArray(logsData)) {
            console.log('[QueryEndGameLog] No data returned or invalid data format');
            return [];
        }

        return logsData;
    }

    createTempLogItem(item: LeanDocument<EndGamesDocument>) {
        console.log(`[CreateTempLogItem] Creating temp log for game round ${item.call.gameRoundId}, player ${item.call.playerId}`);

        const tempLog = new TempLogEndGames();
        tempLog.operatorId = item.operatorId;
        tempLog.playerId = item.call.playerId;
        tempLog.gameRoundId = item.call.gameRoundId;
        tempLog.gameTypeId = item.call.gameTypeId;
        tempLog.logId = item._id;
        tempLog.logTimeStamp = new Date(item.logTimeStamp);
        tempLog.siteId = item.call.siteId;
        tempLog.system = item.system;
        tempLog.totalAmount = +item.call.totalAmount;
        tempLog.totalWin = +item.call.totalWin;
        tempLog.validBetAmount = +item.call.validBetAmount;

        console.log(`[CreateTempLogItem] Temp log created with totalAmount: ${tempLog.totalAmount}, totalWin: ${tempLog.totalWin}`);
        return tempLog;
    }
}
