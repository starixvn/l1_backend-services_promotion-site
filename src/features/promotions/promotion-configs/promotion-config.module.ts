import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionConfigController } from './promotion-config.controller';
import { PromotionConfigService } from './promotion-config.service';
import { PromotionConfigs, PromotionConfigsSchema } from './schemas';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PromotionConfigs.name, schema: PromotionConfigsSchema, collection: 'promotion_configs' }]),
    ],
    providers: [PromotionConfigService],
    exports: [PromotionConfigService],
    controllers: [PromotionConfigController],
})
export class PromotionConfigModule {}
