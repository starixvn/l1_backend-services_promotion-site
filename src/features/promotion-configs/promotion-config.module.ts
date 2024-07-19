import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { ExchangeRates, ExchangeRateSchema } from '../exchange-rates/schemas';
import { NotificationService } from '../notifications/notification.service';
import { Notifications, NotificationsSchema } from '../notifications/schemas';
import { UserClientService } from '../users/services/user-client.service';
import { PromotionConfigController } from './promotion-config.controller';
import { PromotionConfigService } from './promotion-config.service';
import { PromotionConfigs, PromotionConfigsSchema } from './schemas';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PromotionConfigs.name, schema: PromotionConfigsSchema, collection: 'promotion_configs' }]),
        MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema, collection: 'notifications' }]),
        MongooseModule.forFeature([{ name: ExchangeRates.name, schema: ExchangeRateSchema, collection: 'exchange_rates' }]),
    ],
    providers: [PromotionConfigService, NotificationService, UserClientService, ExchangeRateService],
    exports: [PromotionConfigService],
    controllers: [PromotionConfigController],
})
export class PromotionConfigModule {}
