import { ApiProperty } from '@nestjs/swagger';
import { Messages } from 'src/features/notifications/schemas';
import { Result } from '../../../_shared/common/models/result';
import { PromotionConfigs } from '../schemas';
export class PromotionViewModel extends PromotionConfigs {
    /**
     *
     */
    constructor() {
        super();
    }

    title: Messages;
    content: Messages;
}
export class PromotionConfigsResponse extends Result<PromotionViewModel[]> {
    @ApiProperty({ isArray: true, type: PromotionViewModel })
    data: PromotionViewModel[];
}
