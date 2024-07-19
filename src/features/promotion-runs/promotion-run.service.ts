import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PromotionRuns, PromotionRunsDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class PromotionRunService {
    constructor(
        @InjectModel(PromotionRuns.name) private readonly model: Model<PromotionRunsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async getAll(): Promise<Result<PromotionRuns[]>> {
        const execution = this.model.find({}).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async getByPromotionId(promotionId: number): Promise<Result<PromotionRuns>> {
        const execution = this.model.findOne({ promotionId }).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async create(data: PromotionRuns): Promise<Result<PromotionRuns>> {
        return this.dataHandler.createData<PromotionRuns>(this.model, data);
    }

    async updateLatestRunTime(promotionId: number): Promise<Result<PromotionRuns>> {
        const filter = { promotionId };
        const updates = { latestRunTime: new Date() };

        return this.dataHandler.updateData(this.model, filter, updates);
    }
}
