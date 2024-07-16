import { Controller, Get, Inject, NotFoundException, Query, Render } from '@nestjs/common';
import { ErrorCodes, Result } from './_shared/common/models/result';
import { NotificationService } from './features/notifications/notification.service';
import { PromotionConfigService } from './features/promotion-configs/promotion-config.service';
import { UserClientService } from './features/users/services/user-client.service';

@Controller()
export class AppController {
    constructor(
        private readonly service: PromotionConfigService,
        @Inject(NotificationService) private readonly notificationService: NotificationService,
        @Inject(UserClientService) private readonly userClientService: UserClientService,
    ) { }

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
        if (!isAuthenticated && !session.disableAward) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
        }

        const jsonObject = {
            message: 'Hello from Promotion Site!',
            tolgeeInContextTools: process.env.USE_TOLGEE_STATIC === 'true' ?
                {} : {
                    apiUrl: process.env.REACT_APP_TOLGEE_API_URL,
                    apiKey: process.env.REACT_APP_TOLGEE_API_KEY,
                    projectId: "5",
                }
        }

        return { jsonObject: JSON.stringify(jsonObject) };
    }
}
