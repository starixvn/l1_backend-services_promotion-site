import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionConfigModule } from '../promotion-configs/promotion-config.module';
import { UserClientServiceModule } from '../users/user-service.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notifications, NotificationsSchema } from './schemas';
import { User, UserInfos, UserInfosSchema, UserSchema } from '../users/schemas';

@Module({
    imports: [
        PromotionConfigModule,
        UserClientServiceModule,
        MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema, collection: 'notifications' }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'users' }]),
        MongooseModule.forFeature([{ name: UserInfos.name, schema: UserInfosSchema, collection: 'userinfos' }]),
    ],
    providers: [NotificationService],
    exports: [NotificationService],
    controllers: [NotificationController],
})
export class NotificationModule { }
