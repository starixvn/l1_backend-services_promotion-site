import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { UserClientService } from '../users/services/user-client.service';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly promotionConfigService: PromotionConfigService,
        private readonly userClientService: UserClientService,
    ) {}

    @Get('/exist-promotion-tournament')
    @ApiOperation({ operationId: 'existPromotionTournament' })
    @ApiOkResponse({ type: Result<boolean> })
    async existPromotionTournament(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
    ): Promise<Result<boolean>> {
        const { isAuthenticated, session } = await this.userClientService.getSession({ sessionId, username, browserUserAgent });

        if (isAuthenticated && !session.disableAward) {
            const promotionsResult = await this.promotionConfigService.getBySession(session);
            return this.notificationService.existPromotionTournament(promotionsResult.data?.map((promotion) => promotion._id?.toString()));
        }
        return new Result(ErrorCodes.Success, '', false);
    }
}
