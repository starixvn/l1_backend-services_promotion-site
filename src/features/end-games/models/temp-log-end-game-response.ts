import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../../_shared/common/models/result';
import { TempLogEndGames } from '../schemas';

export class TempLogEndGamesResponse extends Result<TempLogEndGames[]> {
    @ApiProperty({ type: [TempLogEndGames] })
    data: TempLogEndGames[];
}
