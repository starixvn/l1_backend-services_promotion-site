import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionRunService } from './promotion-run.service';
import { PromotionRuns, PromotionRunsSchema } from './schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: PromotionRuns.name, schema: PromotionRunsSchema, collection: 'promotion_configs' }])],
    providers: [PromotionRunService],
    exports: [PromotionRunService],
})
export class PromotionRunModule {}
