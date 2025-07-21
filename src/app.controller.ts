import { Controller, Get, Headers, Inject, Query, Render } from '@nestjs/common';
import { ErrorCodes, Result } from './_shared/common/models/result';
import { UserService } from './features/users/services/user.service';
import { PromotionConfigService } from './features/promotion-configs/promotion-config.service';
import { PromotionFreeSpinsService } from './features/promotion-free-spins/promotion-free-spins.service';
import { UserSession } from './features/users/schemas';

@Controller()
export class AppController {
    private static readonly USER_AGENT_HEADER = 'user-agent';
    private static readonly ERROR_MESSAGES = {
        SESSION_INVALID: 'Session invalid',
        PROMOTION_NOT_FOUND: 'Promotion not found',
        BET_LEVEL_NOT_FOUND: 'Bet level not found',
        CLAIM_PROMOTION_FAILED: 'Claim promotion failed'
    };

    constructor(
        @Inject(UserService) private readonly userClientService: UserService,
        @Inject(PromotionConfigService) private readonly promotionConfigService: PromotionConfigService,
        @Inject(PromotionFreeSpinsService) private readonly promotionFreeSpinsService: PromotionFreeSpinsService,
    ) {}

    private createErrorResponse(message: string) {
        return { 
            jsonObject: JSON.stringify({ 
                results: new Result(ErrorCodes.Failed, message) 
            }) 
        };
    }

    private async validateUserSession(sessionId: string, username: string, browserUserAgent: string) {
        if (!sessionId || !username) {
            return { isValid: false, data: null };
        }

        const { isSuccessful, data } = await this.userClientService.getUserSession({ 
            sessionId, 
            username, 
            browserUserAgent 
        });

        return { 
            isValid: isSuccessful && data, 
            data: data as UserSession 
        };
    }

    private getAnnouncementData(announcementFreeSpins: any, language: string) {
        const langDefault = 'en-US';
        if (!announcementFreeSpins) {
            return { title: '', terms: [] };
        }

        const { promotionTitle, termsAndConditions } = announcementFreeSpins;
        return {
            title: promotionTitle[language] || promotionTitle[langDefault],
            terms: termsAndConditions[language] || termsAndConditions[langDefault]
        };
    }

    @Get()
    @Render('index')
    async root(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers(AppController.USER_AGENT_HEADER) browserUserAgent: string,
        @Query('language') language: string,
    ) {
        const { isValid, data } = await this.validateUserSession(sessionId, username, browserUserAgent);
        if (!isValid) {
            return this.createErrorResponse(AppController.ERROR_MESSAGES.SESSION_INVALID);
        }

        const promotionDetailEntryId = await this.promotionConfigService.getPromotionDetailIdEntry(data);

        const jsonObject = {
            results: new Result(ErrorCodes.Success, ''),
            language,
            tolgeeInContextTools: process.env.USE_TOLGEE_STATIC === 'true'
                ? {}
                : {
                    apiUrl: process.env.REACT_APP_TOLGEE_API_URL,
                    apiKey: process.env.REACT_APP_TOLGEE_API_KEY,
                    projectId: '8',
                },
            system: data?.system,
            promotionDetailEntryId,
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
        @Headers(AppController.USER_AGENT_HEADER) browserUserAgent: string,
        @Query('language') language: string,
        @Query('promotionId') promotionId: string
    ) {
        const { isValid, data } = await this.validateUserSession(sessionId, username, browserUserAgent);
        if (!isValid) {
            return this.createErrorResponse(AppController.ERROR_MESSAGES.SESSION_INVALID);
        }

        const promotionFreeSpins = await this.promotionFreeSpinsService.getPromotionById(promotionId);
        if (!promotionFreeSpins) {
            return this.createErrorResponse(AppController.ERROR_MESSAGES.PROMOTION_NOT_FOUND);
        }

        const { code } = promotionFreeSpins;
        const announcementFreeSpins = await this.promotionFreeSpinsService.getAnnouncementByPromotionCode(code);
        
        const { operatorId, siteName, playerId, currencyGroupId } = data;
        const claimPromotion = await this.promotionFreeSpinsService.claimPromotion({
            operatorId,
            siteName,
            playerId,
            currencyGroup: currencyGroupId,
            gameId: promotionFreeSpins.gameIds[0]
        });

        if (!claimPromotion || !claimPromotion.promotion) {
            return this.createErrorResponse(AppController.ERROR_MESSAGES.CLAIM_PROMOTION_FAILED);
        }

        const { promotion: { remainingBonusItems: spins } } = claimPromotion;
        const configs = {
            apiConfigurationUrl: process.env.NEXT_PUBLIC_API_CONFIGURATION_URL
        };
        const { apiConfigurationUrl } = configs;

        const jsonObject = {
            results: new Result(ErrorCodes.Success, ''),
            language,
            promotionFreeSpins,
            announcementFreeSpins,
            configs: { apiConfigurationUrl },
            spins,
            serverTime: new Date().toISOString(),
        };

        const jsonString = JSON.stringify(jsonObject);
        // Escape the JSON string for safe embedding in JavaScript
        const escapedJsonString = jsonString
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/'/g, "\\'")    // Escape single quotes
            .replace(/"/g, '\\"')    // Escape double quotes
            .replace(/\n/g, '\\n')   // Escape newlines
            .replace(/\r/g, '\\r')   // Escape carriage returns
            .replace(/\t/g, '\\t');  // Escape tabs

        return { 
            jsonObject: escapedJsonString
        };
    }

    @Get('/announcement-detail')
    @Render('announcement-detail')
    async announcementDetail(
        @Query('sessionId') sessionId: string,
        @Query('username') username: string,
        @Headers(AppController.USER_AGENT_HEADER) browserUserAgent: string,
        @Query('language') language: string,
        @Query('promotionId') promotionId: string,
        @Query('game') game: string,
        @Query('showBackButton') showBackButton: string
    ) {
        const { isValid, data } = await this.validateUserSession(sessionId, username, browserUserAgent);
        if (!isValid) {
            return this.createErrorResponse(AppController.ERROR_MESSAGES.SESSION_INVALID);
        }

        const promotionFreeSpins = await this.promotionFreeSpinsService.getPromotionById(promotionId);
        if (!promotionFreeSpins) {
            return this.createErrorResponse(AppController.ERROR_MESSAGES.PROMOTION_NOT_FOUND);
        }

        const { code, gameIds, bonusItemCount, betLevels, gameConfigType } = promotionFreeSpins;
        const announcementFreeSpins = await this.promotionFreeSpinsService.getAnnouncementByPromotionCode(code);
        const { title: announcementTittle, terms } = this.getAnnouncementData(announcementFreeSpins, language);

        const betLevelObj = betLevels.find(
            (item) => item.currencyGroup === data.currencyGroupId
        );

        const { betLevel } = betLevelObj;
        const totalBetPerSpin = this.promotionFreeSpinsService.getTotalBet(betLevel, gameConfigType);

        const jsonObject = {
            results: new Result(ErrorCodes.Success, ''),
            language,
            announcementTittle,
            terms,
            eligibleGames: gameIds.join(', '),
            freeSpinReward: bonusItemCount,
            totalBetPerSpin,
            game: game ? JSON.parse(game) : null,
            promotionFreeSpins,
            showBackButton: showBackButton === 'true'
        };

        const jsonString = JSON.stringify(jsonObject);
        // Escape the JSON string for safe embedding in JavaScript
        const escapedJsonString = jsonString
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/'/g, "\\'")    // Escape single quotes
            .replace(/"/g, '\\"')    // Escape double quotes
            .replace(/\n/g, '\\n')   // Escape newlines
            .replace(/\r/g, '\\r')   // Escape carriage returns
            .replace(/\t/g, '\\t');  // Escape tabs

        return { 
            jsonObject: escapedJsonString
        };
    }
}