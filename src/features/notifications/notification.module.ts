import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionConfigModule } from '../promotion-configs/promotion-config.module';
import { UserClientServiceModule } from '../users/user-service.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notifications, NotificationsSchema } from './schemas';

@Module({
    imports: [
        PromotionConfigModule,
        UserClientServiceModule,
        MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema, collection: 'notifications' }]),
    ],
    providers: [NotificationService],
    exports: [NotificationService],
    controllers: [NotificationController],
})
export class NotificationModule {}
