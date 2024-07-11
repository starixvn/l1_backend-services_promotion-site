import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../_shared/common/models/result';
import { NotificationService } from '../notifications/notification.service';
import { UserSessionsService } from '../users/services/user-session.service';
import { PromotionConfigsResponse, PromotionViewModel } from './models/promotion-configs-response';
import { PromotionConfigService } from './promotion-config.service';
import { PromotionConfigs } from './schemas';

@ApiTags('promotion-config')
@Controller('promotion-config')
export class PromotionConfigController {
    constructor(
        private readonly service: PromotionConfigService,
        @Inject(UserSessionsService) private readonly userSessionsService: UserSessionsService,
        @Inject(NotificationService) private readonly notificationService: NotificationService,
    ) {}

    @Get('/')
    @ApiOperation({ operationId: 'getAll' })
    @ApiOkResponse({ type: PromotionConfigsResponse })
    async getAll(): Promise<Result<PromotionConfigs[]>> {
        return this.service.getAll();
    }

    @Post('/getPromotionsByUserSession')
    @ApiOperation({ operationId: 'getPromotionsByUserSession' })
    @ApiOkResponse({ type: PromotionConfigsResponse })
    async getPromotionsByUserSession(
        @Body() userSession: { session: string; username: string; browserUserAgent: string },
    ): Promise<Result<PromotionViewModel[]>> {
        const { isAuthenticated, session } = await this.userSessionsService.verifySession(userSession);
        if (!isAuthenticated) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
        }
        //TODO: Temp set for dev purpose
        session.currencyGroupId = '61765beed2b6510001f18bd6';
        const promotions = await this.service.getByCurrencyGroupId(session.currencyGroupId);
        if (promotions.data.length == 0) {
            return new Result(ErrorCodes.Failed, 'No Promotion for user');
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
