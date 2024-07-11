import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PromotionBets, PromotionBetsDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class PromotionBetService {
    constructor(
        @InjectModel(PromotionBets.name) private readonly model: Model<PromotionBetsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async getAll(): Promise<Result<PromotionBets[]>> {
        const execution = this.model.find({}).lean().exec();
        return this.dataHandler.getData(execution);
    }
}
