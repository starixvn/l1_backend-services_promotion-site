import { Controller, Get, Query } from '@nestjs/common';
import { PromotionConfigService } from './promotion-config.service';
import { PromotionConfigs } from './schemas';
import { Result } from '../common/models/result';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionConfigResponse } from './models/promotion-config-response';

@ApiTags('promotion-config')
@Controller('promotion-config')
export class PromotionConfigController {
    constructor(private readonly service: PromotionConfigService) {}

    @Get('/')
    @ApiOperation({ operationId: 'getAll' })
    @ApiOkResponse({ type: PromotionConfigResponse })
    async getAll(): Promise<Result<PromotionConfigs[]>> {
        return this.service.getAll();
    }
}
