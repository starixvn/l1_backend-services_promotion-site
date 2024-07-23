import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeRateService } from '../exchange-rates/exchange-rate.service';
import { ExchangeRates, ExchangeRateSchema } from '../exchange-rates/schemas';
import { UserService } from '../users/services/user.service';
import { LeaderBoardController } from './leader-board.controller';
import { LeaderBoardService } from './leader-board.service';
import { PromotionLeaderBoards, PromotionLeaderBoardsSchema } from './schemas';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PromotionLeaderBoards.name, schema: PromotionLeaderBoardsSchema, collection: 'promotion_leaderboards' },
            { name: ExchangeRates.name, schema: ExchangeRateSchema, collection: 'exchange_rates' },
        ]),
    ],
    providers: [LeaderBoardService, UserService, ExchangeRateService],
    exports: [LeaderBoardService],
    controllers: [LeaderBoardController],
})
export class LeaderBoardModule {}
