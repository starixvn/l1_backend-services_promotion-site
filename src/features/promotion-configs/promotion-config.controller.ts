import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '../../_shared/common/models/result';
import { PromotionConfigResponse } from './models/promotion-config-response';
import { PromotionConfigsResponse } from './models/promotion-configs-response';
import { PromotionConfigService } from './promotion-config.service';
import { PromotionConfigs } from './schemas';

@ApiTags('promotion-config')
@Controller('promotion-config')
export class PromotionConfigController {
    constructor(private readonly service: PromotionConfigService) {}

    @Get('/')
    @ApiOperation({ operationId: 'getAll' })
    @ApiOkResponse({ type: PromotionConfigsResponse })
    async getAll(): Promise<Result<PromotionConfigs[]>> {
        return this.service.getAll();
    }

    @Get('/getPromotionsBySession/:session')
    @ApiOperation({ operationId: 'getPromotionsBySession' })
    @ApiOkResponse({ type: PromotionConfigResponse })
    async getPromotionsBySession(@Param('session') session: string): Promise<Result<PromotionConfigs>> {
        console.log(session);
        const currencyGroupId = '61765beed2b6510001f18bd6';
        return await this.service.getByCurrencyGroupId(currencyGroupId);
    }
}
