import { ApiProperty } from '@nestjs/swagger';
import { Messages } from 'src/features/notifications/schemas';
import { Result } from '../../../_shared/common/models/result';
import { PromotionConfigs } from '../schemas';
import { PromotionViewModelFake } from './promotion-configs-response-fake';
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

export class PromotionConfigsResponse extends Result<PromotionViewModelFake[]> {
    @ApiProperty({ isArray: true, type: PromotionViewModelFake })
    data: PromotionViewModelFake[];
}


