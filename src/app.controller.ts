import { Controller, Get, Headers, Inject, Query, Render } from '@nestjs/common';
import { ErrorCodes, Result } from './_shared/common/models/result';
import { UserService } from './features/users/services/user.service';
import { PromotionConfigService } from './features/promotion-configs/promotion-config.service';

@Controller()
export class AppController {
    constructor(
        @Inject(UserService) private readonly userClientService: UserService,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
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

        const { isSuccessful, data } = await this.userClientService.getUserSession({ sessionId, username, browserUserAgent });
        if (!isSuccessful) {
            return unauthorizedResult;
        }

        const promotionDetailEntryId = await this.promotionConfigService.getPromotionDetailEntry(data);

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
            system: data?.system,
            promotionDetailEntryId: promotionDetailEntryId
        };

        return { jsonObject: JSON.stringify(jsonObject) };
    }

    @Get('/icon')
    @Render('icon')
    icon() {
        return {};
    }
}
