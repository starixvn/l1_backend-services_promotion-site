import { ApiProperty } from '@nestjs/swagger';
import { Result } from '../../../_shared/common/models/result';
import { PromotionConfigs } from '../schemas';

export class PromotionConfigResponse extends Result<PromotionConfigs> {
    @ApiProperty({ type: PromotionConfigs })
    data: PromotionConfigs;
}
