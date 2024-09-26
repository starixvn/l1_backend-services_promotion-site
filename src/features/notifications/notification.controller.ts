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
    ) { }

    @Get('/exist-promotion-tournament-notification')
    @ApiOperation({ operationId: 'existPromotionTournamentNotification' })
    @ApiOkResponse({ type: Boolean })
    async existPromotionTournamentNotification(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
    ): Promise<Boolean> {
        const { isSuccessful, data: session } = await this.userClientService.getUserSession({ sessionId, username, browserUserAgent });

        if (!isSuccessful) {
            return false;
        }
        const promotionsResult = await this.promotionConfigService.getBySession(session);
        const isExistedNotification = await this.notificationService.existPromotionTournamentNotification(promotionsResult.data?.map((promotion) => promotion._id?.toString()));
        return isExistedNotification;
    }

    @Get('/exist-new-or-running-promotion-tournament')
    @ApiOperation({ operationId: 'existNewOrRunningPromotionTournament' })
    @ApiOkResponse({ type: Boolean })
    async getNewOrRunningPromotionTournament(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
    ): Promise<Boolean> {
        const { isSuccessful, data: session } = await this.userClientService.getUserSession({ sessionId, username, browserUserAgent });

        if (!isSuccessful) {
            return false;
        }
        const numerousNewOrRunningTournament = await this.promotionConfigService.getNewOrRunningPromotionDetail(session);
        return numerousNewOrRunningTournament > 0;
    }

    @Get('/exist-running-promotion-tournament')
    @ApiOperation({ operationId: 'existRunningPromotionTournament' })
    @ApiOkResponse({ type: Result<boolean> })
    async existRunningPromotionTournament(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
    ): Promise<Result<boolean>> {
        const { isSuccessful, data: session } = await this.userClientService.getUserSession({ sessionId, username, browserUserAgent });

        if (!isSuccessful) {
            return new Result(ErrorCodes.Success, '', false);
        }
        const promotionsResult = await this.promotionConfigService.getBySession(session);
        return this.notificationService.existValidNotificationInTournament(
            promotionsResult.data?.map((promotion) => promotion._id?.toString()),
        );
    }
}
