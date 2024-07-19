import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, Schema } from 'mongoose';

import { PromotionBets, PromotionBetsDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';
import { EndGamesSchema, EndGamesDocument, EndGames, TempLogEndGames, LOG_DB, END_GAMES_COLLECTION } from '../end-games/schemas';
import { TempLogEndGameService } from '../end-games/temp-log-end-game.service';

@Injectable()
export class PromotionBetService {
    constructor(
        @InjectModel(PromotionBets.name) private readonly model: Model<PromotionBetsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
        @Inject(TempLogEndGameService) private readonly tempLogEndGameService: TempLogEndGameService,
    ) {}

    async getAll(): Promise<Result<PromotionBets[]>> {
        const execution = this.model.find({}).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async getBets(startTime: Date, endTime: Date, latestDataSourceTimeStamp: Date): Promise<Result<PromotionBets[]>> {
        const startDateTime = latestDataSourceTimeStamp && latestDataSourceTimeStamp > startTime ? latestDataSourceTimeStamp : startTime;
        const execution = this.model
            .find({
                dataSourceTimeStamp: { $gt: startDateTime, $lt: endTime },
            })
            .sort({ dataSourceTimeStamp: 1 })
            .lean()
            .exec();
        return this.dataHandler.getData(execution);
    }

    async getLatestDataSourceTimeStamp(): Promise<Date> {
        const execution = this.model.findOne({}).sort({ dataSourceTimeStamp: -1 }).lean().exec();
        return (await this.dataHandler.getData(execution))?.data?.dataSourceTimeStamp;
    }

    async syncEndGameLog(): Promise<void> {
        const endGameLogs = await this.queryEndGameLog();
        const tempLogData = endGameLogs
            .filter((item) => +item.call.totalWin > +item.call.totalAmount)
            .map((item) => {
                return this.createTempLogItem(item);
            });
        await this.tempLogEndGameService.deleteAll();
        await this.tempLogEndGameService.insertMany(tempLogData);
        await this.tempLogEndGameService.syncToPromotionBet();
    }

    async queryEndGameLog(): Promise<LeanDocument<EndGamesDocument>[]> {
        const latestDataSourceTimeStamp = await this.getLatestDataSourceTimeStamp();
        const queryTime = latestDataSourceTimeStamp ? latestDataSourceTimeStamp : new Date(new Date().setDate(new Date().getDate() - 1));
        const logDB = this.model.db.useDb(LOG_DB);
        const endGameModel = logDB.model<EndGamesDocument>(END_GAMES_COLLECTION, EndGamesSchema as any);
        const execution = endGameModel
            .find({ logTimeStamp: { $gt: queryTime.toISOString() } })
            .lean()
            .exec();
        const endGameLogs = await this.dataHandler.getData(execution);
        return endGameLogs.data;
    }

    createTempLogItem(item: LeanDocument<EndGamesDocument>) {
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

        return tempLog;
    }
}
