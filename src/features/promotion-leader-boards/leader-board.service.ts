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
}
