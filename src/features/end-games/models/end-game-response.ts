import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../../_shared/common/models/result';
import { EndGames } from '../schemas';

export class EndGamesResponse extends Result<EndGames[]> {
    @ApiProperty({ type: [EndGames] })
    data: EndGames[];
}
