import { Controller, Get, Query } from '@nestjs/common';
import { PromotionBetService } from './promotion-bet.service';
import { PromotionBets } from './schemas';
import { Result } from '../../_shared/common/models/result';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionBetResponse } from './models/promotion-bet-response';

@ApiTags('promotion-bet')
@Controller('promotion-bet')
export class PromotionBetController {
    constructor(private readonly service: PromotionBetService) {}

    @Get('/')
    @ApiOperation({ operationId: 'getAll' })
    @ApiOkResponse({ type: PromotionBetResponse })
    async getAll(): Promise<Result<PromotionBets[]>> {
        return this.service.getAll();
    }
}
