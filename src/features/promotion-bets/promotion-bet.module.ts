import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionBetController } from './promotion-bet.controller';
import { PromotionBetService } from './promotion-bet.service';
import { PromotionBets, PromotionBetsSchema } from './schemas';
import { TempLogEndGameModule } from '../end-games/temp-log-end-game.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PromotionBets.name, schema: PromotionBetsSchema, collection: 'promotion_bets' }]),
        TempLogEndGameModule,
    ],
    providers: [PromotionBetService],
    exports: [PromotionBetService],
    controllers: [PromotionBetController],
})
export class PromotionBetModule {}
