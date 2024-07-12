import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameConfigService } from './game-config.service';
import { GameConfigs, GameConfigsSchema } from './schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: GameConfigs.name, schema: GameConfigsSchema, collection: 'game_configs' }])],
    providers: [GameConfigService],
    exports: [GameConfigService],
})
export class GameConfigModule {}
