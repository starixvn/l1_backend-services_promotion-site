import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notifications, NotificationsDocument } from './schemas';
import { DataHandler } from '../../_shared/common/providers';
import { Result } from '../../_shared/common/models/result';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notifications.name) private readonly model: Model<NotificationsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async existPromotionTournament(promotionIds: number[]): Promise<Result<boolean>> {
        const execution = this.model.exists({ displayKind: 4, enabled: true, promotionId: { $in: promotionIds } });
        return this.dataHandler.getData(execution);
    }
}
