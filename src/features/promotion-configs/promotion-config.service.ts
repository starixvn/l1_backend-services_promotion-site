import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';
import { PromotionConfigs, PromotionConfigsDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';

@Injectable()
export class PromotionConfigService {
    constructor(
        @InjectModel(PromotionConfigs.name) private readonly model: Model<PromotionConfigsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
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

    async getByCurrencyGroupId(currencyGroupId: string): Promise<Result<PromotionConfigs[]>> {
        const filter = { 'operators.currencyGroups.currencyGroupId': currencyGroupId, 'operators.currencyGroups.enabled': true };
        const execution = this.model.find(filter).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async getByCurrencyGroupIdAndSiteName(
        operatorId: string,
        siteName: string,
        currencyGroupId: string,
    ): Promise<Result<PromotionConfigs[]>> {
        const promotions = (await this.getByCurrencyGroupId(currencyGroupId)).data;
        if (promotions.length > 0) {
            const data = promotions.filter((promotion) =>
                promotion.operators.some(
                    (operator) => operator.operatorId === operatorId && !operator.excludedSiteNames?.split(',').includes(siteName),
                ),
            );
            return new Result(ErrorCodes.Success, '', data);
        }
        return new Result(ErrorCodes.Success, '', []);
    }
}
