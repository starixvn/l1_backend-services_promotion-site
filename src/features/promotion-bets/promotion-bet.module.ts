import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TempLogEndGameModule } from '../end-games/temp-log-end-game.module';
import { PromotionBetService } from './promotion-bet.service';
import { PromotionBets, PromotionBetsSchema } from './schemas';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PromotionBets.name, schema: PromotionBetsSchema, collection: 'promotion_bets' }]),
        TempLogEndGameModule,
    ],
    providers: [PromotionBetService],
    exports: [PromotionBetService],
    controllers: [],
})
export class PromotionBetModule {}
