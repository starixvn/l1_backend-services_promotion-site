import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PromotionFreeSpinsService {
    constructor() {}

    GAME_TYPES = {
        CLASSIC: 2,
        CASCADING: 3,
    } as const;

    async getPromotionById(promotionId: string) {
        const baseUrl = process.env.PROMOTION_API_BASE_URL; 
        if (!baseUrl) throw new Error('PROMOTION_API_BASE_URL is not set');
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
        if (!baseUrl) throw new Error('PROMOTION_API_BASE_URL is not set');
        const url = `${baseUrl}/promotion-announcements/by-promotion-code/${promotionCode}`;
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (e) {
            return null;
        }
    }

    getTotalBet(betLevel: number, gameType: number) {
        return gameType === this.GAME_TYPES.CASCADING ? 1 * betLevel * 20 : betLevel * 25;
    }
} 