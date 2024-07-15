import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { NotificationService } from '../notifications/notification.service';
import { VerifySessionRequest } from '../users/models';
import { UserClientService } from '../users/services/user-client.service';
import { PromotionConfigsResponse, PromotionViewModel } from './models/promotion-configs-response';
import { PromotionConfigService } from './promotion-config.service';
import { PromotionConfigs } from './schemas';

@ApiTags('promotion-config')
@Controller('promotion-config')
export class PromotionConfigController {
    constructor(
        private readonly service: PromotionConfigService,
        @Inject(NotificationService) private readonly notificationService: NotificationService,
        @Inject(UserClientService) private readonly userSessionService: UserClientService,
    ) {}

    @Get('/')
    @ApiOperation({ operationId: 'getAll' })
    @ApiOkResponse({ type: PromotionConfigsResponse })
    async getAll(): Promise<Result<PromotionConfigs[]>> {
        return this.service.getAll();
    }

    @Post('/getByUserSession')
    @ApiOperation({ operationId: 'getByUserSession' })
    @ApiOkResponse({ type: PromotionConfigsResponse })
    async getByUserSession(@Body() userSession: VerifySessionRequest): Promise<Result<PromotionViewModel[]>> {
        const { isAuthenticated, session } = await this.userSessionService.getSession(userSession);

        if (!isAuthenticated) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
        }

        if (session.disableAward) {
            return new Result(ErrorCodes.Failed, 'User is disable award');
        }
        //TODO: Temp set for dev purpose
        session.currencyGroupId = '61b953ad815d6c000196a14c';
        const promotions = await this.service.getBySession(session);
        if (promotions.data.length == 0) {
            return new Result(ErrorCodes.Failed, 'No Promotion records');
        }
        const promotionIds = promotions.data.map((promotion) => promotion.promotionId);
        const notifications = await this.notificationService.getPromotionByIds(promotionIds);
        const result: PromotionViewModel[] = [];
        promotions.data.forEach((promotion) => {
            notifications.data.forEach((notification) => {
                if (promotion.promotionId == notification.promotionId) {
                    const promotionVM: PromotionViewModel = {
                        ...promotion,
                        title: notification.title,
                        content: notification.messages,
                    };
                    result.push(promotionVM);
                }
            });
        });
        return new Result(0, '', result);
    }
}
