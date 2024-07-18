import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserClientService } from '../users/services/user-client.service';
import { LeaderBoardController } from './leader-board.controller';
import { LeaderBoardService } from './leader-board.service';
import { PromotionLeaderBoards, PromotionLeaderBoardsSchema } from './schemas';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PromotionLeaderBoards.name, schema: PromotionLeaderBoardsSchema, collection: 'promotion_leaderboards' },
        ]),
    ],
    providers: [LeaderBoardService, UserClientService],
    exports: [LeaderBoardService],
    controllers: [LeaderBoardController],
})
export class LeaderBoardModule {}
