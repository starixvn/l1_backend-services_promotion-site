import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../../_shared/common/models/result';
import { PromotionBets } from '../schemas';

export class PromotionBetResponse extends Result<PromotionBets[]> {
    @ApiProperty({ type: [PromotionBets] })
    data: PromotionBets[];
}
