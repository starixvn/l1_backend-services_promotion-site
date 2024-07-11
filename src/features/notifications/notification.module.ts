import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notifications, NotificationsSchema } from './schemas';
import { UserSessionsService } from '../users/services/user-session.service';
import { PromotionConfigModule } from '../promotion-configs/promotion-config.module';
import { UserModule } from '../users/user.module';

@Module({
    imports: [
        PromotionConfigModule,
        UserModule,
        MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema, collection: 'notifications' }]),
    ],
    providers: [NotificationService],
    exports: [NotificationService],
    controllers: [NotificationController],
})
export class NotificationModule {}
