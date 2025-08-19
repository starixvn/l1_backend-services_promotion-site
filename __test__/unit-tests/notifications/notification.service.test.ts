import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from '../../../src/features/notifications/notification.service';
import { Notifications, NotificationsDocument } from '../../../src/features/notifications/schemas';
import { DataHandler } from '../../../src/_shared/common/providers';
import { ErrorCodes, Result } from '../../../src/_shared/common/models/result';

describe('NotificationService', () => {
    let service: NotificationService;
    let model: Model<NotificationsDocument>;
    let dataHandler: DataHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: getModelToken(Notifications.name),
                    useValue: {
                        countDocuments: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: DataHandler,
                    useValue: {
                        getData: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
        model = module.get<Model<NotificationsDocument>>(getModelToken(Notifications.name));
        dataHandler = module.get<DataHandler>(DataHandler);
    });

    describe('existPromotionTournamentNotification', () => {
        it('should return false if promotionIds is empty', async () => {
            const result = await service.existPromotionTournamentNotification([]);

            expect(result).toBe(false);
        });

        it('should return the result of model.countDocuments when promotionIds is provided', async () => {
            jest.spyOn(model, 'countDocuments').mockResolvedValue(2);
            const result = await service.existPromotionTournamentNotification(['promo1', 'promo2']);

            expect(result).toBe(true);
            expect(model.countDocuments).toHaveBeenCalledWith({ displayKind: 4, enabled: true, promotionId: { $in: ['promo1', 'promo2'] } });
        });

        it('should return false when countDocuments returns 0', async () => {
            jest.spyOn(model, 'countDocuments').mockResolvedValue(0);
            const result = await service.existPromotionTournamentNotification(['promo1', 'promo2']);

            expect(result).toBe(false);
        });
    });

    describe('existValidNotificationInTournament', () => {
        it('should return false in a Result object if promotionIds is empty', async () => {
            const result = await service.existValidNotificationInTournament([]);

            expect(result).toEqual(new Result(ErrorCodes.Success, '', false));
        });

        it('should return the result of countDocuments when promotionIds are provided', async () => {
            const now = new Date();
            jest.spyOn(model, 'countDocuments').mockResolvedValue(1);

            const result = await service.existValidNotificationInTournament(['promo1']);

            expect(model.countDocuments).toHaveBeenCalledWith({
                displayKind: 4,
                enabled: true,
                promotionId: { $in: ['promo1'] },
                startTime: { $lte: now },
                endTime: { $gte: now },
            });
            expect(result).toEqual(new Result(ErrorCodes.Success, '', true));
        });

        it('should return false when countDocuments returns 0', async () => {
            const now = new Date();
            jest.spyOn(model, 'countDocuments').mockResolvedValue(0);

            const result = await service.existValidNotificationInTournament(['promo1']);

            expect(result).toEqual(new Result(ErrorCodes.Success, '', false));
        });
    });

    describe('getPromotionByIds', () => {
        it('should return the result of dataHandler.getData when promotionIds are provided', async () => {
            const mockPromotions = [{ promotionId: 'promo1' }, { promotionId: 'promo2' }];
            jest.spyOn(model, 'find').mockReturnValue({
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockPromotions),
            } as any);
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(new Result(ErrorCodes.Success, '', mockPromotions));

            const result = await service.getPromotionByIds(['promo1', 'promo2']);

            expect(model.find).toHaveBeenCalledWith({ displayKind: 4, enabled: true, promotionId: { $in: ['promo1', 'promo2'] } });
            expect(result).toEqual(new Result(ErrorCodes.Success, '', mockPromotions));
        });
    });

    describe('getPromotionById', () => {
        it('should return the result of dataHandler.getData when a promotionId is provided', async () => {
            const mockPromotion = { promotionId: 'promo1' };
            jest.spyOn(model, 'findOne').mockReturnValue({
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockPromotion),
            } as any);
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(new Result(ErrorCodes.Success, '', mockPromotion));

            const result = await service.getPromotionById('promo1');

            expect(model.findOne).toHaveBeenCalledWith({ displayKind: 4, enabled: true, promotionId: 'promo1' });
            expect(result).toEqual(new Result(ErrorCodes.Success, '', mockPromotion));
        });
    });
});
