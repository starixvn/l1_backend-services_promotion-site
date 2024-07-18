import { Controller, Get, Headers, Inject, Query, Render } from '@nestjs/common';
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
        @Headers('user-agent') browserUserAgent: string,
        @Query('language') language: string,
    ) {
        const unauthorizedResult = { jsonObject: JSON.stringify({ results: new Result(ErrorCodes.Failed, 'Session invalid') }) };

        if (!sessionId || !username || !username) {
            return unauthorizedResult;
        }

        const { isSuccessful } = await this.userClientService.getSessionVerify({ sessionId, username, browserUserAgent });
        if (!isSuccessful) {
            return unauthorizedResult;
        }

        const jsonObject = {
            results: new Result(ErrorCodes.Success, ''),
            language,
            tolgeeInContextTools:
                process.env.USE_TOLGEE_STATIC === 'true'
                    ? {}
                    : {
                        apiUrl: process.env.REACT_APP_TOLGEE_API_URL,
                        apiKey: process.env.REACT_APP_TOLGEE_API_KEY,
                        projectId: '5',
                    },
        };

        return { jsonObject: JSON.stringify(jsonObject) };
    }

    @Get('/icon')
    @Render('icon')
    icon() {
        return {};
    }
}
