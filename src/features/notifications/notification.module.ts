import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notifications, NotificationsSchema } from './schemas';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { UserSessionsService } from '../users/services/user-session.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema, collection: 'notifications' }])],
    providers: [NotificationService, PromotionConfigService, UserSessionsService],
    exports: [NotificationService],
    controllers: [NotificationController],
})
export class NotificationModule {}
