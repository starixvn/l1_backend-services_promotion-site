import { WinningPrize } from "../schemas";
import { PromotionDetailViewModel, PromotionViewModel, Status, WinningPrizeViewModel } from "./promotion-configs-response";

describe('PromotionConfigResponse', () => {
    describe('PromotionViewModel', () => {
        it('should have status "New" if current time is before startDateTime', () => {
            const futureDate = new Date(new Date().getTime() + 3600000); // 1 hour in the future
            const promo = new PromotionViewModel(1, 'Promo Title', 'Promo Content', futureDate, new Date(futureDate.getTime() + 3600000));
            expect(promo.status).toBe(Status.New);
            expect(promo.isCompleted).toBe(false);
        });

        it('should have status "Running" if current time is between startDateTime and endDateTime', () => {
            const pastDate = new Date(new Date().getTime() - 3600000); // 1 hour in the past
            const futureDate = new Date(new Date().getTime() + 3600000); // 1 hour in the future
            const promo = new PromotionViewModel(1, 'Promo Title', 'Promo Content', pastDate, futureDate);
            expect(promo.status).toBe(Status.Running);
            expect(promo.isCompleted).toBe(false);
        });

        it('should have status "Completed" if current time is after endDateTime', () => {
            const pastDate = new Date(new Date().getTime() - 3600000); // 1 hour in the past
            const oldDate = new Date(pastDate.getTime() - 3600000); // 1 hour before pastDate
            const promo = new PromotionViewModel(1, 'Promo Title', 'Promo Content', oldDate, pastDate);
            expect(promo.status).toBe(Status.Completed);
            expect(promo.isCompleted).toBe(true);
        });

        it('should handle edge cases where startDateTime and endDateTime are the same', () => {
            const now = new Date();
            const promo = new PromotionViewModel(1, 'Promo Title', 'Promo Content', now, now);
            expect(promo.getStatus()).toBe(Status.Completed);
        });
    });

    describe('WinningPrizeViewModel', () => {
        it('should set from and to correctly for a single number ranking', () => {
            const prize = new WinningPrizeViewModel(100, '1');
            expect(prize.from).toBe(1);
            expect(prize.to).toBeUndefined();
            expect(prize.value).toBe(100);
            expect(prize.ranking).toBe('1');
        });

        it('should set from and to correctly for a range ranking', () => {
            const prize = new WinningPrizeViewModel(200, '1-3');
            expect(prize.from).toBe(1);
            expect(prize.to).toBe(3);
            expect(prize.value).toBe(200);
            expect(prize.ranking).toBe('1-3');
        });

        it('should set from and to correctly for a single number as first part of range', () => {
            const prize = new WinningPrizeViewModel(150, '4');
            expect(prize.from).toBe(4);
            expect(prize.to).toBeUndefined();
            expect(prize.value).toBe(150);
            expect(prize.ranking).toBe('4');
        });

        it('should throw an error for invalid ranking format', () => {
            expect(() => {
                new WinningPrizeViewModel(100, 'invalid');
            }).toThrowError('Invalid ranking format: invalid');
        });

        it('should throw an error for non-numeric ranking', () => {
            expect(() => {
                new WinningPrizeViewModel(100, 'abc');
            }).toThrowError('Invalid ranking format: abc');
        });

        it('should throw an error for ranking with more than two parts', () => {
            expect(() => {
                new WinningPrizeViewModel(100, '1-3-5');
            }).toThrowError('Invalid ranking format: 1-3-5');
        });
    });

    describe('PromotionDetailViewModel', () => {
        it('should calculate the total prize correctly', () => {
            const prizes: WinningPrize[] = [
                { value: 100, ranking: '1-3' },
                { value: 150, ranking: '4' },
            ];

            const promotion = new PromotionDetailViewModel('Test Promo', new Date(), new Date(), 10, 20, prizes);
            expect(promotion.totalPrize).toBe(450);
        });

        it('should handle a single prize correctly', () => {
            const prizes: WinningPrize[] = [
                { value: 200, ranking: '1' },
            ];

            const promotion = new PromotionDetailViewModel('Test Promo', new Date(), new Date(), 10, 20, prizes);
            expect(promotion.totalPrize).toBe(200);
        });

        it('should handle an empty array correctly', () => {
            const prizes: WinningPrize[] = [];

            const promotion = new PromotionDetailViewModel('Test Promo', new Date(), new Date(), 10, 20, prizes);
            expect(promotion.totalPrize).toBe(0);
        });

        it('should calculate numerousPrize correctly', () => {
            const prizes: WinningPrize[] = [
                { value: 100, ranking: '1-3' },
                { value: 150, ranking: '4' },
            ];

            const promotion = new PromotionDetailViewModel('Test Promo', new Date(), new Date(), 10, 20, prizes);
            expect(promotion.numerousPrize).toBe(4);
        });
    });
});
