import { Test, TestingModule } from '@nestjs/testing';
import { ErrorCodes, Result } from '../../../src/_shared/common/models/result';
import { NotificationService } from '../../../src/features/notifications/notification.service';
import { PromotionConfigController } from '../../../src/features/promotion-configs/promotion-config.controller';
import { PromotionConfigService } from '../../../src/features/promotion-configs/promotion-config.service';
import { UserService } from '../../../src/features/users/services/user.service';
import { isIncludedSite } from '../../../src/features/promotion-configs/helpers/promotion-helper';
import { LeanDocument } from 'mongoose';
import { PromotionConfigsDocument } from 'src/features/promotion-configs/schemas';

jest.mock('../../../src/features/promotion-configs/helpers/promotion-helper');

describe('PromotionConfigController', () => {
    let controller: PromotionConfigController;
    let promotionConfigService: PromotionConfigService;
    let notificationService: NotificationService;
    let userService: UserService;
    const sessionId = 'session123';
    const username = 'user123';
    const userAgent = 'Mozilla/5.0';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PromotionConfigController],
            providers: [
                {
                    provide: PromotionConfigService,
                    useValue: {
                        getBySession: jest.fn(),
                        getById: jest.fn(),
                        getPromotionsByNotifications: jest.fn(),
                        getPromotionDetail: jest.fn()
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        getPromotionByIds: jest.fn(),
                        getPromotionById: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        getUserSession: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PromotionConfigController>(PromotionConfigController);
        promotionConfigService = module.get<PromotionConfigService>(PromotionConfigService);
        notificationService = module.get<NotificationService>(NotificationService);
        userService = module.get<UserService>(UserService);
    });

    describe('getByUserSession', () => {
        it('should return promotions when successful', async () => {
            const mockSession = new Result(ErrorCodes.Success,
                '', { language: 'en' });

            const mockPromotions = [{ _id: '1' } as any, { _id: '2' } as any];

            const mockNotifications = {
                data: [{ title: { en: 'Promotion 1' } }, { title: { en: 'Promotion 2' } }],
            };

            jest.spyOn(userService, 'getUserSession').mockResolvedValue(mockSession as any);
            jest.spyOn(promotionConfigService, 'getBySession').mockResolvedValue(new Result(
                ErrorCodes.Success,
                '',
                mockPromotions
            ) as any);
            jest.spyOn(notificationService, 'getPromotionByIds').mockResolvedValue(mockNotifications as any);

            promotionConfigService.getPromotionsByNotifications = jest.fn().mockResolvedValue(mockPromotions);
            (isIncludedSite as jest.Mock).mockReturnValue(false);
            const result = await controller.getByUserSession(sessionId, username, userAgent);

            expect(result).toBeInstanceOf(Result);
            expect(result.errorCode).toBe(ErrorCodes.Success);
        });

        it('should return error if user session fails', async () => {
            jest.spyOn(userService, 'getUserSession').mockResolvedValue({
                isSuccessful: false,
                errorMessage: 'Session not found',
            } as any);

            const result = await controller.getByUserSession(sessionId, username, userAgent);

            expect(result.errorCode).toBe(ErrorCodes.Failed);
            expect(result.errorMessage).toBe('Session not found');
        });

        it('should return error if no promotions found', async () => {
            const sessionId = 'session123';
            const username = 'user123';
            const userAgent = 'Mozilla/5.0';

            jest.spyOn(userService, 'getUserSession').mockResolvedValue({
                isSuccessful: true,
                data: {},
            } as any);

            jest.spyOn(promotionConfigService, 'getBySession').mockResolvedValue({
                data: [],
            } as any);

            const result = await controller.getByUserSession(sessionId, username, userAgent);

            expect(result.errorCode).toBe(ErrorCodes.Failed);
            expect(result.errorMessage).toBe('No Promotion records');
        });
    });

    describe('getById', () => {
        it('should return promotion detail when found', async () => {
            const promotionId = 1;

            const mockSession = { currencyGroupId: 'currency123', language: 'en' };
            const mockPromotion = { _id: '1' } as LeanDocument<PromotionConfigsDocument>;
            const mockNotification = { data: { title: { en: 'Promotion Title' } } };

            jest.spyOn(userService, 'getUserSession').mockResolvedValue({
                isSuccessful: true,
                data: mockSession,
            } as any);

            jest.spyOn(promotionConfigService, 'getById').mockResolvedValue(new Result(
                ErrorCodes.Success,
                '',
                mockPromotion
            ));

            jest.spyOn(notificationService, 'getPromotionById').mockResolvedValue(mockNotification as any);
            jest.spyOn(promotionConfigService, 'getPromotionDetail').mockResolvedValue({ title: 'Promotion Title' } as any);
            (isIncludedSite as jest.Mock).mockReturnValue(true);
            const result = await controller.getById(promotionId, sessionId, username, userAgent);

            expect(result).toBeInstanceOf(Result);
            expect(result.errorCode).toBe(ErrorCodes.Success);
            expect(result.data).toHaveProperty('title', 'Promotion Title');
        });

        it('should return error if promotion not found', async () => {
            const promotionId = 1;

            jest.spyOn(userService, 'getUserSession').mockResolvedValue({
                isSuccessful: true,
                data: {},
            } as any);

            jest.spyOn(promotionConfigService, 'getById').mockResolvedValue({
                errorCode: ErrorCodes.Failed,
            } as any);

            const result = await controller.getById(promotionId, sessionId, username, userAgent);

            expect(result.errorCode).toBe(ErrorCodes.Failed);
            expect(result.errorMessage).toBe('Not Found Promotion');
        });

        it('should return error if promotion does not belong to user', async () => {
            const promotionId = 1;

            const mockSession = { currencyGroupId: 'currency123', language: 'en' };
            const mockPromotion = { _id: '1' };

            jest.spyOn(userService, 'getUserSession').mockResolvedValue({
                isSuccessful: true,
                data: mockSession,
            } as any);

            jest.spyOn(promotionConfigService, 'getById').mockResolvedValue({
                errorCode: ErrorCodes.Success,
                data: mockPromotion,
            } as any);

            (isIncludedSite as jest.Mock).mockReturnValue(false);

            const result = await controller.getById(promotionId, sessionId, username, userAgent);

            expect(result.errorCode).toBe(ErrorCodes.Failed);
            expect(result.errorMessage).toBe('Promotion not belong to user');
        });
    });
});
