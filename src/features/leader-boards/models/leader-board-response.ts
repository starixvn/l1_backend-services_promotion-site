import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../../_shared/common/models/result';
import { PromotionLeaderBoards } from '../schemas';

export class LeaderBoardResponse extends Result<PromotionLeaderBoards[]> {
    @ApiProperty({ type: [PromotionLeaderBoards] })
    data: PromotionLeaderBoards[];
}
