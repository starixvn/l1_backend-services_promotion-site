import { Controller, Get, Headers, Inject, Query, Render } from '@nestjs/common';
import { ErrorCodes, Result } from './_shared/common/models/result';
import { UserService } from './features/users/services/user.service';
import { PromotionConfigService } from './features/promotion-configs/promotion-config.service';
import { PromotionFreeSpinsService } from './features/promotion-free-spins/promotion-free-spins.service';

@Controller()
export class AppController {
    constructor(
        @Inject(UserService) private readonly userClientService: UserService,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(PromotionFreeSpinsService) private readonly promotionFreeSpinsService: PromotionFreeSpinsService,
    ) {}

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

        const promotionDetailEntryId = await this.promotionConfigService.getPromotionDetailIdEntry(data);

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
            promotionDetailEntryId: promotionDetailEntryId,
        };

        return { jsonObject: JSON.stringify(jsonObject) };
    }

    @Get('/icon')
    @Render('icon')
    icon() {
        return {};
    }

    @Get('/banner-promotions')
    @Render('banner-promotion')
    async bannerPromotions(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
        @Query('language') language: string,
        @Query('promotionId') promotionId: string
    ) {
        const unauthorizedResult = { jsonObject: JSON.stringify({ results: new Result(ErrorCodes.Failed, 'Session invalid') }) };

        if (!sessionId || !username || !username) {
            return unauthorizedResult;
        }

        const { isSuccessful, data } = await this.userClientService.getUserSession({ sessionId, username, browserUserAgent });
        if (!isSuccessful) {
            return unauthorizedResult;
        }
        const promotionFreeSpins = await this.promotionFreeSpinsService.getPromotionById(promotionId);
        const announcementFreeSpins = await this.promotionFreeSpinsService.getAnnouncementById(promotionFreeSpins?.code);
        const claimPromotion = await this.promotionFreeSpinsService.claimPromotion({
            operatorId: data?.operatorId,
            siteName: data?.siteName,
            playerId: data?.playerId,
            currencyGroup: data?.currencyGroupId,
        });
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
            promotionFreeSpins: promotionFreeSpins,
            announcementFreeSpins: announcementFreeSpins,
            configs: {
                apiConfigurationUrl: process.env.NEXT_PUBLIC_API_CONFIGURATION_URL
            },
            spins: claimPromotion?.promotion?.remainingBonusItems,
        };
        return { jsonObject: JSON.stringify(jsonObject)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')
            .replace(/\\n/g, '\\\\n') };
    }

    @Get('/announcement-detail')
    @Render('announcement-detail')
    async announcementDetail(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
        @Query('language') language: string,
        @Query('promotionId') promotionId: string,
        @Query('game') game: string
    ) {
        const unauthorizedResult = { jsonObject: JSON.stringify({ results: new Result(ErrorCodes.Failed, 'Session invalid') }) };

        if (!sessionId || !username || !username) {
            return unauthorizedResult;
        }

        const { isSuccessful, data } = await this.userClientService.getUserSession({ sessionId, username, browserUserAgent });
        if (!isSuccessful) {
            return unauthorizedResult;
        }
        const promotionFreeSpins = await this.promotionFreeSpinsService.getPromotionById(promotionId);
        const announcementFreeSpins = await this.promotionFreeSpinsService.getAnnouncementById(promotionFreeSpins?.code);        
        const announcementTittle =
            announcementFreeSpins?.promotionTitle?.[language] ||
            announcementFreeSpins?.promotionTitle?.['en-US'] ||
            '';

        const terms =
            announcementFreeSpins?.termsAndConditions?.[language] ||
            announcementFreeSpins?.termsAndConditions?.['en-US'] ||
            [];

        const startDate = promotionFreeSpins?.startDate;
        const endDate = promotionFreeSpins?.endDate;
        const duration = startDate && endDate
            ? `From ${new Date(startDate).toLocaleString()} to ${new Date(endDate).toLocaleString()}`
            : '';

        const eligibleGames = Array.isArray(promotionFreeSpins?.gameIds)
            ? promotionFreeSpins.gameIds.join(', ')
            : '';

        const freeSpinReward = promotionFreeSpins?.bonusItemCount || '';

        const betLevelObj = promotionFreeSpins?.betLevels?.find(
            (item) => item.currencyGroup === data?.currencyGroupId
        );
        const totalBetPerSpin = this.promotionFreeSpinsService.getTotalBet(betLevelObj?.betLevel, promotionFreeSpins?.gameConfigType);

        const jsonObject = {
            results: new Result(ErrorCodes.Success, ''),
            language,
            announcementTittle,
            terms,
            duration,
            eligibleGames,
            freeSpinReward,
            totalBetPerSpin,
            game: game ? JSON.parse(game) : null
        };
        return { jsonObject: JSON.stringify(jsonObject)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')
            .replace(/\\n/g, '\\\\n') };
    }
}
