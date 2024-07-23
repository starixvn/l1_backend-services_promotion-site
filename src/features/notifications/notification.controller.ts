import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { PromotionConfigService } from '../promotion-configs/promotion-config.service';
import { UserService } from '../users/services/user.service';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly promotionConfigService: PromotionConfigService,
        private readonly userClientService: UserService,
    ) {}

    @Get('/exist-promotion-tournament')
    @ApiOperation({ operationId: 'existPromotionTournament' })
    @ApiOkResponse({ type: Result<boolean> })
    async existPromotionTournament(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
    ): Promise<Result<boolean>> {
        const { isSuccessful, data: session } = await this.userClientService.getUserSession({ sessionId, username, browserUserAgent });

        if (!isSuccessful) {
            return new Result(ErrorCodes.Success, '', false);
        }
        const promotionsResult = await this.promotionConfigService.getBySession(session);
        return this.notificationService.existPromotionTournament(promotionsResult.data?.map((promotion) => promotion._id?.toString()));
    }
}
