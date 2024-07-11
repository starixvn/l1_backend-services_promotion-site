import { Controller, Get, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { UserSessionsService } from '../users/services/user-session.service';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly promotionConfigService: PromotionConfigService,
        private readonly userSessionService: UserSessionsService,
    ) {}

    @Get('/exist-promotion-tournament')
    @ApiOperation({ operationId: 'existPromotionTournament' })
    @ApiOkResponse({ type: Result<boolean> })
    async existPromotionTournament(@Query('ss') sessionId: string): Promise<Result<boolean>> {
        const userSession = await this.userSessionService.getUserSession(sessionId);
        if (userSession) {
            const promotionsResult = await this.promotionConfigService.getByCurrencyGroupIdAndSiteName(
                userSession.operatorId,
                userSession.siteName,
                userSession.currencyGroupId,
            );
            return this.notificationService.existPromotionTournament(promotionsResult.data?.map((promotion) => promotion.promotionId));
        }
        return new Result(ErrorCodes.Failed, '', false);
    }
}
