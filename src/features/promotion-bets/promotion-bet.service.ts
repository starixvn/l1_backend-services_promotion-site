import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, Schema } from 'mongoose';

import { PromotionBets, PromotionBetsDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';
import { EndGamesSchema, EndGamesDocument, EndGames, TempLogEndGames } from '../end-games/schemas';
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
                dataSourceTimeStamp: { $gte: startDateTime, $lte: endTime },
            })
            .lean()
            .exec();
        return this.dataHandler.getData(execution);
    }

    async getLatestDataSourceTimeStamp(): Promise<Date> {
        const execution = this.model.findOne({}).sort({ dataSourceTimeStamp: -1 }).lean().exec();
        return (await this.dataHandler.getData(execution))?.data?.dataSourceTimeStamp;
    }

    async syncEndGameLog(): Promise<void> {
        const logDB = this.model.db.useDb('log');
        const endGameModel = logDB.model<EndGamesDocument>('end_games', EndGamesSchema as any);
        const execution = endGameModel.find({}).lean().exec();
        const data = await this.dataHandler.getData(execution);
        const tempLogData = data.data.map((item) => {
            return this.createTempLogItem(item);
        });
        await this.tempLogEndGameService.deleteAll();
        await this.tempLogEndGameService.insertMany(tempLogData);
        const latestDataSourceTimeStamp = await this.getLatestDataSourceTimeStamp();
        await this.tempLogEndGameService.syncToPromotionBet(latestDataSourceTimeStamp);
    }

    createTempLogItem(item: LeanDocument<EndGamesDocument>) {
        const tempLog = new TempLogEndGames();
        tempLog.operatorId = item.operatorId;
        tempLog.playerId = item.call.playerId;
        tempLog.gameRoundId = item.call.gameRoundId;
        tempLog.gameTypeId = item.call.gameTypeId;
        tempLog.logId = item._id;
        tempLog.logTimeStamp = item.logTimeStamp;
        tempLog.siteId = item.call.siteId;
        tempLog.system = item.system;
        tempLog.totalAmount = +item.call.totalAmount;
        tempLog.totalWin = +item.call.totalWin;

        return tempLog;
    }
}
