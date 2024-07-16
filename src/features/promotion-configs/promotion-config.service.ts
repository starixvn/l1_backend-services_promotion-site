import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';

import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { UserSession } from '../users/schemas';
import { PromotionConfigs, PromotionConfigsDocument } from './schemas';
import { PROMOTION_STATUSES } from './schemas';

@Injectable()
export class PromotionConfigService {
    constructor(
        @InjectModel(PromotionConfigs.name) private readonly model: Model<PromotionConfigsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,

        private readonly logger: SentryLogger,
    ) {}

    async getAll(): Promise<Result<PromotionConfigs[]>> {
        const execution = this.model.find({}).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async getPromotionsByStatus(status: string): Promise<Result<PromotionConfigs[]>> {
        const execution = this.model.find({ status }).lean().exec();
        return this.dataHandler.getData(execution);
    }

    async updatePromotionStatus(promotionId: number, status: string): Promise<Result<PromotionConfigs>> {
        const filter = { promotionId };
        const updates = { status: status, updatedTime: new Date() };

        return this.dataHandler.updateData(this.model, filter, updates);
    }

    async getBySession(session: UserSession): Promise<Result<LeanDocument<PromotionConfigsDocument>[]>> {
        const filter = {
            'operators.currencyGroups.currencyGroupId': session.currencyGroupId,
            'operators.currencyGroups.enabled': true,
        };
        const execution = this.model
            .find(filter)
            .sort([['startDateTime', -1]])
            .lean()
            .exec();

        const promotions = await this.dataHandler.getData(execution);
        if (promotions?.data?.length > 0) {
            const data = promotions?.data.filter((promotion) =>
                promotion.operators.some(
                    (operator) =>
                        operator.operatorId === session.operatorId && !operator.excludedSiteNames?.split(',').includes(session.siteName),
                ),
            );
            return new Result(ErrorCodes.Success, '', data);
        }
        return new Result(ErrorCodes.Success, '', []);
    }
}
