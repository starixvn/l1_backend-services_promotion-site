import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaderBoardController } from './leader-board.controller';
import { LeaderBoardService } from './leader-board.service';
import { PromotionLeaderBoards, PromotionLeaderBoardsSchema } from './schemas';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PromotionLeaderBoards.name, schema: PromotionLeaderBoardsSchema, collection: 'promotion_leaderboards' },
        ]),
    ],
    providers: [LeaderBoardService],
    exports: [LeaderBoardService],
    controllers: [LeaderBoardController],
})
export class LeaderBoardModule {}
