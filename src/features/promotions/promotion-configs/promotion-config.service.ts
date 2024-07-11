import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ErrorCodes, ErrorMessages, Result } from '../../../_shared/common/models/result';
import { SentryLogger } from '../../../_shared/common/providers';
import { PromotionConfigs, PromotionConfigsDocument } from './schemas';

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

    async getByCurrencyGroupId(currencyGroupId: string): Promise<Result<PromotionConfigs>> {
        try {
            const data = (await this.model.find({}).lean().exec()) as PromotionConfigs[];
            const result = data.find((promotionConfigs) =>
                promotionConfigs.operators.some((operator) =>
                    operator.currencyGroups.some((currencyGroup) => currencyGroup.currencyGroupId === currencyGroupId),
                ),
            );

            return new Result(ErrorCodes.Success, ErrorMessages.Empty, result);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }
}
