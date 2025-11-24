import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { SentryLogger } from '../../_shared/common/providers';

@Injectable()
export class PromotionFreeSpinsService {
    private readonly logger: SentryLogger;

    constructor(@Inject(SentryLogger) logger: SentryLogger) {
        this.logger = logger;
    }
    errorMessage = 'PROMOTION_API_BASE_URL is not set';
    GAME_TYPES = {
        CLASSIC: 2,
        CASCADING: 3,
    } as const;
    Multiplier = {
        CLASSIC: 25,
        CASCADING: 20,
    } as const;

    async getPromotionById(promotionId: string) {
        const baseUrl = process.env.PROMOTION_API_BASE_URL; 
        if (!baseUrl) {
            throw new Error(this.errorMessage);
        }
        const url = `${baseUrl}/promotions/${promotionId}`;
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    async getAnnouncementByPromotionCode(promotionCode: string) {
        const baseUrl = process.env.PROMOTION_API_BASE_URL; 
        if (!baseUrl) {
            throw new Error(this.errorMessage);
        }
        const url = `${baseUrl}/promotion-announcements/by-promotion-code/${promotionCode}`;
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    async claimPromotion({
        operatorId,
        siteName,
        playerId,
        currencyGroup,
        gameId
    }: {
        operatorId: string;
        siteName: string;
        playerId: string;
        currencyGroup: string;
        gameId: number;
    }) {
        const baseUrl = process.env.PROMOTION_API_BASE_URL;
        if (!baseUrl) {
            throw new Error(this.errorMessage);
        }
        const url = `${baseUrl}/player-promotions/claim-promotion`;
        try {
            const res = await axios.post(url, {
                operatorId,
                siteName,
                playerId,
                currencyGroup,
                gameId
            });
            return res.data;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    getTotalBet(betLevel = 0, coinValue = 0, gameType: number, xMode: number) {
        return gameType === this.GAME_TYPES.CASCADING ? coinValue * this.Multiplier.CASCADING * xMode : betLevel * this.Multiplier.CLASSIC * xMode;
    }
} 