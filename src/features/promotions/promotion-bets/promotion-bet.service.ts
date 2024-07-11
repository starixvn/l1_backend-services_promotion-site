import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PromotionBets, PromotionBetsDocument } from './schemas';
import { SentryLogger } from '../../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../../_shared/common/models/result';

@Injectable()
export class PromotionBetService {
    constructor(
        @InjectModel(PromotionBets.name) private readonly model: Model<PromotionBetsDocument>,
        private readonly logger: SentryLogger,
    ) {}

    async getAll(): Promise<Result<PromotionBets[]>> {
        try {
            const data = (await this.model.find({}).lean().exec()) as PromotionBets[];
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, data);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }
}
