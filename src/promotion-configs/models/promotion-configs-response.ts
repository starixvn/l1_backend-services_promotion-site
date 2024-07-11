import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../common/models/result';
import { PromotionConfigs } from '../schemas';

export class PromotionConfigsResponse extends Result<PromotionConfigs[]> {
    @ApiProperty({ type: PromotionConfigs })
    data: PromotionConfigs[];
}
