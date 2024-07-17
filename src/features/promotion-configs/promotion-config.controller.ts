import { Body, Controller, Headers, Inject, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { NotificationService } from '../notifications/notification.service';
import { UserClientService } from '../users/services/user-client.service';
import {
    PromotionConfigResponse,
    PromotionConfigsResponse,
    PromotionDetailViewModel,
    PromotionViewModel,
} from './models/promotion-configs-response';
import { fakePromotionDetails, PromotionDetailViewModelFake } from './models/promotion-configs-response-fake';
import { PromotionConfigService } from './promotion-config.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionConfigController {
    constructor(
        private readonly service: PromotionConfigService,
        @Inject(NotificationService) private readonly notificationService: NotificationService,
        @Inject(UserClientService) private readonly userClientService: UserClientService,
    ) {}

    @Post('/')
    @ApiOperation({ operationId: 'getByUserSession' })
    @ApiOkResponse({ type: PromotionConfigsResponse })
    async getByUserSession(
        @Body('sessionId') sessionId: string,
        @Body('username') username: string,
        @Body('lang') lang: string = 'en-US',
        @Headers('user-agent') browserUserAgent: string,
    ): Promise<PromotionConfigsResponse> {
        const { isAuthenticated, session } = await this.userClientService.getSession({
            sessionId,
            username,
            browserUserAgent,
        });

        if (!isAuthenticated) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
        }

        if (session.disableAward) {
            return new Result(ErrorCodes.Failed, 'User is disable award');
        }

        const promotions = await this.service.getBySession(session);
        if (promotions.data.length == 0) {
            return new Result(ErrorCodes.Failed, 'No Promotion records');
        }
        const promotionIds = promotions.data.map((promotion) => promotion._id?.toString());
        const notifications = await this.notificationService.getPromotionByIds(promotionIds);
        const result: PromotionViewModel[] = this.service.getPromotionsByNotifications(promotions.data, notifications.data, lang);

        return new Result(ErrorCodes.Success, '', result);
    }

    @Post('/:id')
    @ApiOperation({ operationId: 'getById' })
    @ApiOkResponse({ type: PromotionConfigResponse })
    async getById(
        @Param('id') id: number,
        @Body('sessionId') sessionId: string,
        @Body('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
    ): Promise<PromotionConfigResponse> {
        const { isAuthenticated, session } = await this.userClientService.getSession({
            sessionId,
            username,
            browserUserAgent,
        });

        if (!isAuthenticated) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
        }

        if (session.disableAward) {
            return new Result(ErrorCodes.Failed, 'User is disable award');
        }

        const promotion = await this.service.getById(id);
        if (promotion.errorCode === ErrorCodes.Failed) {
            return new Result(ErrorCodes.Failed, 'Not Found Promotion');
        }
        const isBelongToUser = () => {
            return promotion.data.operators.some(
                (operator) =>
                    operator.operatorId === session.operatorId && operator.includedSiteNames?.split(',').includes(session.siteName),
            );
        };

        if (!isBelongToUser) {
            return new Result(ErrorCodes.Failed, 'Promotion not belong to user');
        }

        const result: PromotionDetailViewModel = new PromotionDetailViewModel(promotion.data.winningPrizes);
        return new Result(ErrorCodes.Success, '', result);
    }

    @Post('/getPromotionDetails')
    async getPromotionDetails(): Promise<Result<PromotionDetailViewModelFake>> {
        return new Result(0, '', fakePromotionDetails);
    }
}
