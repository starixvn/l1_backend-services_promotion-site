import { Body, Controller, Headers, Inject, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { NotificationService } from '../notifications/notification.service';
import { UserClientService } from '../users/services/user-client.service';
import { isIncludedSite } from './helpers/promotion-helper';
import {
    PromotionConfigResponse,
    PromotionConfigsResponse,
    PromotionDetailViewModel
} from './models/promotion-configs-response';
import { fakePromotionDetails, fakePromotions } from './models/promotion-configs-response-fake';
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
        @Headers('user-agent') browserUserAgent: string,
    ): Promise<PromotionConfigsResponse> {
        const {
            isSuccessful,
            errorMessage,
            data: session,
        } = await this.userClientService.getUserSession({
            sessionId,
            username,
            browserUserAgent,
        });

        if (!isSuccessful) {
            return new Result(ErrorCodes.Failed, errorMessage);
        }

        const promotions = await this.service.getBySession(session);
        if (promotions.data.length === 0) {
            return new Result(ErrorCodes.Failed, 'No Promotion records');
        }
        const promotionIds = promotions.data.map((promotion) => promotion._id?.toString());
        const notifications = await this.notificationService.getPromotionByIds(promotionIds);

        return new Result(
            ErrorCodes.Success,
            '',
            this.service.getPromotionsByNotifications(promotions.data, notifications.data, session.language),
        );
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
        const {
            isSuccessful,
            errorMessage,
            data: session,
        } = await this.userClientService.getUserSession({
            sessionId,
            username,
            browserUserAgent,
        });

        if (!isSuccessful) {
            return new Result(ErrorCodes.Failed, errorMessage);
        }

        const getPromotionResult = await this.service.getById(id, session.currencyGroupId);
        if (getPromotionResult.errorCode === ErrorCodes.Failed) {
            return new Result(ErrorCodes.Failed, 'Not Found Promotion');
        }
        const promotion = getPromotionResult.data;

        if (!isIncludedSite(promotion, session)) {
            return new Result(ErrorCodes.Failed, 'Promotion not belong to user');
        }
        const notification = await this.notificationService.getPromotionById(promotion._id);
        if (!notification.data) {
            return new Result(ErrorCodes.Failed, 'Promotion data not available');
        }
        const title = notification.data.title[session.language];
        const result: PromotionDetailViewModel = await this.service.getPromotionDetail(promotion, session, title);
        return new Result(ErrorCodes.Success, '', result);
    }

    @Post('/getPromotionsFake')
    async getPromotionsFake() {
        return new Result(0, '', fakePromotions);
    }

    @Post('/getPromotionDetailsFake')
    async getPromotionDetailsFake() {
        return new Result(0, '', fakePromotionDetails);
    }
}
