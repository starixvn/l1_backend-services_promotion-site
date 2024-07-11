import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from '../notifications/notification.service';
import { Notifications, NotificationsSchema } from '../notifications/schemas';
import { UserSession, UserSessionSchema } from '../users/schemas';
import { UserSessionsService } from '../users/services/user-session.service';
import { PromotionConfigController } from './promotion-config.controller';
import { PromotionConfigService } from './promotion-config.service';
import { PromotionConfigs, PromotionConfigsSchema } from './schemas';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PromotionConfigs.name, schema: PromotionConfigsSchema, collection: 'promotion_configs' }]),
        MongooseModule.forFeature([{ name: UserSession.name, schema: UserSessionSchema, collection: 'usersessions' }]),
        MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema, collection: 'notifications' }]),
    ],
    providers: [PromotionConfigService, UserSessionsService, NotificationService],
    exports: [PromotionConfigService],
    controllers: [PromotionConfigController],
})
export class PromotionConfigModule {}
