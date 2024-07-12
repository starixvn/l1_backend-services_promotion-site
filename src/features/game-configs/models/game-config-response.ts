import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../../_shared/common/models/result';
import { GameConfigs } from '../schemas';

export class GameConfigResponse extends Result<GameConfigs[]> {
    @ApiProperty({ type: [GameConfigs] })
    data: GameConfigs[];
}
