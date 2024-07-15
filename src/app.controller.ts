import { Controller, Get, Inject, NotFoundException, Query, Render } from '@nestjs/common';
import { ErrorCodes, Result } from './_shared/common/models/result';
import { NotificationService } from './features/notifications/notification.service';
import { PromotionViewModel } from './features/promotion-configs/models/promotion-configs-response';
import { PromotionConfigService } from './features/promotion-configs/promotion-config.service';
import { UserClientService } from './features/users/services/user-client.service';

@Controller()
export class AppController {
    constructor(
        private readonly service: PromotionConfigService,
        @Inject(NotificationService) private readonly notificationService: NotificationService,
        @Inject(UserClientService) private readonly userClientService: UserClientService,
    ) {}

    @Get()
    @Render('index')
    async root(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Query('browserUserAgent') browserUserAgent: string,
    ) {
        if (!sessionId || !username || !username) {
            return new NotFoundException('');
        }
        const { isAuthenticated, session } = await this.userClientService.getSession({ sessionId, username, browserUserAgent });
        if (!isAuthenticated) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
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

        const jsonObject = {
            message: 'Hello from Promotion Site!',
            date: Date.toString(),
            subPath: process.env.SUB_PATH,
            result,
        };

        return { jsonObject: JSON.stringify(jsonObject) };
    }
}
