import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PromotionRuns, PromotionRunsDocument } from './schemas';
import { SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class PromotionRunService {
    constructor(
        @InjectModel(PromotionRuns.name) private readonly model: Model<PromotionRunsDocument>,
        private readonly logger: SentryLogger,
    ) {}

    async getAll(): Promise<Result<PromotionRuns[]>> {
        try {
            const data = (await this.model.find({}).lean().exec()) as PromotionRuns[];
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, data);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }
}
