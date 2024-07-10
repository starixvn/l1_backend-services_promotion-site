import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../common/models/result';
import { PromotionRuns } from '../schemas';

export class PromotionRunResponse extends Result<PromotionRuns[]> {
    @ApiProperty({ type: [PromotionRuns] })
    data: PromotionRuns[];
}
