import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';

import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { Notifications } from '../notifications/schemas';
import { UserSession } from '../users/schemas';
import { PromotionViewModel } from './models/promotion-configs-response';
import { PromotionConfigs, PromotionConfigsDocument } from './schemas';

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

    async getById(id: number): Promise<Result<LeanDocument<PromotionConfigsDocument>>> {
        const filter = {
            promotionId: id,
        };
        const execution = this.model.findOne(filter).lean().exec();

        const promotion = await this.dataHandler.getData(execution);
        if (promotion?.data) {
            return new Result(ErrorCodes.Success, '', promotion?.data);
        }
        return new Result(ErrorCodes.Failed, '');
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

    getPromotionsByNotifications(
        promotions: LeanDocument<PromotionConfigsDocument>[],
        notifications: Notifications[],
        lang: string = 'en-US',
    ): PromotionViewModel[] {
        let result: PromotionViewModel[] = [];
        if (notifications.length > 0) {
            promotions.forEach((promotion) => {
                notifications.forEach((notification) => {
                    if (promotion._id?.toString() == notification.promotionId) {
                        result.push(
                            new PromotionViewModel(
                                promotion.promotionId,
                                notification.title[lang],
                                notification.messages[lang],
                                promotion.startDateTime,
                                promotion.endDateTime,
                            ),
                        );
                    }
                });
            });
        }
        const sortByStatusThenTime = (a: PromotionViewModel, b: PromotionViewModel): number =>
            a.status - b.status || b.startDateTime.getTime() - a.startDateTime.getTime();
        result.sort(sortByStatusThenTime);

        return result;
    }
}
