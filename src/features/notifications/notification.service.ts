import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { Notifications, NotificationsDocument } from './schemas';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notifications.name) private readonly model: Model<NotificationsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async existPromotionTournament(promotionIds: string[]): Promise<Result<boolean>> {
        if (promotionIds?.length > 0) {
            const execution = this.model.exists({ displayKind: 4, enabled: true, promotionId: { $in: promotionIds } });
            return this.dataHandler.getData(execution);
        }
        return new Result(ErrorCodes.Success, '', false);
    }

    async existValidNotificationInTournament(promotionIds: string[]): Promise<Result<boolean>> {
        if (promotionIds?.length > 0) {
            const now = new Date();
            const execution = this.model.exists({
                displayKind: 4,
                enabled: true,
                promotionId: { $in: promotionIds },
                startTime: { $lte: now },
                endTime: { $gte: now },
            });
            return this.dataHandler.getData(execution);
        }
        return new Result(ErrorCodes.Success, '', false);
    }

    async getPromotionByIds(promotionIds: string[]): Promise<Result<Notifications[]>> {
        const execution = this.model
            .find({ displayKind: 4, enabled: true, promotionId: { $in: promotionIds } })
            .lean()
            .exec();
        return this.dataHandler.getData(execution);
    }

    async getPromotionById(promotionId: string): Promise<Result<Notifications>> {
        const execution = this.model.findOne({ displayKind: 4, enabled: true, promotionId }).lean().exec();
        return this.dataHandler.getData(execution);
    }
}
