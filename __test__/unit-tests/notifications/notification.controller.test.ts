import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../../../src/features/notifications/notification.controller';
import { NotificationService } from '../../../src/features/notifications/notification.service';
import { PromotionConfigService } from '../../../src/features/promotion-configs/promotion-config.service';
import { UserService } from '../../../src/features/users/services/user.service';
import { ErrorCodes, Result } from '../../../src/_shared/common/models/result';

describe('NotificationController', () => {
    let controller: NotificationController;
    let notificationService: NotificationService;
    let promotionConfigService: PromotionConfigService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationController],
            providers: [
                {
                    provide: NotificationService,
                    useValue: {
                        existPromotionTournamentNotification: jest.fn(),
                        existValidNotificationInTournament: jest.fn(),
                    },
                },
                {
                    provide: PromotionConfigService,
                    useValue: {
                        getBySession: jest.fn(),
                        isExistedNewOrRunningPromotionTournament: jest.fn(),
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

        controller = module.get<NotificationController>(NotificationController);
        notificationService = module.get<NotificationService>(NotificationService);
        promotionConfigService = module.get<PromotionConfigService>(PromotionConfigService);
        userService = module.get<UserService>(UserService);
    });

    describe('existPromotionTournamentNotification', () => {
        it('should return false if user session is not successful', async () => {
            jest.spyOn(userService, 'getUserSession').mockResolvedValue({ isSuccessful: false } as any);

            const result = await controller.existPromotionTournamentNotification('session1', 'user1', 'agent');

            expect(result).toBe(false);
        });

        it('should return the result from notificationService', async () => {
            const mockPromotions = [{ _id: 'promo1' }];
            jest.spyOn(userService, 'getUserSession').mockResolvedValue({ isSuccessful: true, data: {} } as any);
            jest.spyOn(promotionConfigService, 'getBySession').mockResolvedValue({ data: mockPromotions } as any);
            jest.spyOn(notificationService, 'existPromotionTournamentNotification').mockResolvedValue(true);

            const result = await controller.existPromotionTournamentNotification('session1', 'user1', 'agent');

            expect(result).toBe(true);
            expect(notificationService.existPromotionTournamentNotification).toHaveBeenCalledWith(['promo1']);
        });
    });

    describe('getNewOrRunningPromotionTournament', () => {
        it('should return false if user session is not successful', async () => {
            jest.spyOn(userService, 'getUserSession').mockResolvedValue({ isSuccessful: false } as any);

            const result = await controller.getNewOrRunningPromotionTournament('session1', 'user1', false, 'agent');

            expect(result).toBe(false);
        });

        it('should return the result from promotionConfigService', async () => {
            jest.spyOn(userService, 'getUserSession').mockResolvedValue({ isSuccessful: true, data: {} } as any);
            jest.spyOn(promotionConfigService, 'isExistedNewOrRunningPromotionTournament').mockResolvedValue(true);

            const result = await controller.getNewOrRunningPromotionTournament('session1', 'user1', false, 'agent');

            expect(result).toBe(true);
            expect(promotionConfigService.isExistedNewOrRunningPromotionTournament).toHaveBeenCalled();
        });
    });

    describe('existRunningPromotionTournament', () => {
        it('should return a Result object with false if user session is not successful', async () => {
            jest.spyOn(userService, 'getUserSession').mockResolvedValue({ isSuccessful: false } as any);

            const result = await controller.existRunningPromotionTournament('session1', 'user1', 'agent');

            expect(result).toEqual(new Result(ErrorCodes.Success, '', false));
        });

        it('should return the result from notificationService', async () => {
            const mockPromotions = [{ _id: 'promo1' }];
            jest.spyOn(userService, 'getUserSession').mockResolvedValue({ isSuccessful: true, data: {} } as any);
            jest.spyOn(promotionConfigService, 'getBySession').mockResolvedValue({ data: mockPromotions } as any);
            jest.spyOn(notificationService, 'existValidNotificationInTournament').mockResolvedValue(new Result(ErrorCodes.Success, '', true));

            const result = await controller.existRunningPromotionTournament('session1', 'user1', 'agent');

            expect(result).toEqual(new Result(ErrorCodes.Success, '', true));
            expect(notificationService.existValidNotificationInTournament).toHaveBeenCalledWith(['promo1']);
        });
    });
});
