import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PromotionConfigs, PromotionConfigsDocument } from './schemas';
import { SentryLogger } from '../common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../common/models/result';

@Injectable()
export class PromotionConfigService {
    constructor(
        @InjectModel(PromotionConfigs.name) private readonly model: Model<PromotionConfigsDocument>,
        private readonly logger: SentryLogger,
    ) {}

    async getAll(): Promise<Result<PromotionConfigs[]>> {
        try {
            const data = (await this.model.find({}).lean().exec()) as PromotionConfigs[];
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, data);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }
}
