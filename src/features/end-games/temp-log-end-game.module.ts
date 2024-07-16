import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TempLogEndGameService } from './temp-log-end-game.service';
import { TempLogEndGames, TempLogEndGamesSchema } from './schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: TempLogEndGames.name, schema: TempLogEndGamesSchema, collection: 'temp_log_end_games' }])],
    providers: [TempLogEndGameService],
    exports: [TempLogEndGameService],
})
export class TempLogEndGameModule {}
