import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PromotionFreeSpinsService {
    constructor() {}
    errorMessage = 'PROMOTION_API_BASE_URL is not set';
    GAME_TYPES = {
        CLASSIC: 2,
        CASCADING: 3,
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
        } catch (e) {
            return null;
        }
    }

    async getAnnouncementById(promotionCode: string) {
        const baseUrl = process.env.PROMOTION_API_BASE_URL; 
        if (!baseUrl) {
            throw new Error(this.errorMessage);
        }
        const url = `${baseUrl}/promotion-announcements/by-promotion-code/${promotionCode}`;
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (e) {
            return null;
        }
    }

    async claimPromotion({
        operatorId,
        siteName,
        playerId,
        currencyGroup,
    }: {
        operatorId: string;
        siteName: string;
        playerId: string;
        currencyGroup: string;
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
            });
            return res.data;
        } catch (e) {
            return null;
        }
    }

    getTotalBet(betLevel: number, gameType: number) {
        return gameType === this.GAME_TYPES.CASCADING ? 1 * betLevel * 20 : betLevel * 25;
    }
} 