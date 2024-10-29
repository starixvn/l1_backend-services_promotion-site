import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';

import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { Notifications, NotificationsDocument } from './schemas';
import { User, UserDocument, UserInfos, UserInfosDocument } from '../users/schemas';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notifications.name) private readonly model: Model<NotificationsDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(UserInfos.name) private readonly userinfosModel: Model<UserInfosDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) { }

    async existPromotionTournamentNotification(promotionIds: string[]): Promise<boolean> {
        if (promotionIds?.length > 0) {
            return this.model.exists({ displayKind: 4, enabled: true, promotionId: { $in: promotionIds } });
        }

        return false;
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

    async checkExistedNickname(username: string) {
        const result = await this.userModel.findOne({ 'local.username': username }).lean().exec();
        const relatedUserInfosWithUser = await this.userinfosModel.findOne({ id: result._id }).lean().exec();

        return relatedUserInfosWithUser;
    }
}
