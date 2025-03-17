import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Notifications } from 'src/features/notifications/schemas';
import { exchangeRates, validSession } from '../../../__test__/integration-tests/_stubs/helper';
import { Result } from '../../../src/_shared/common/models/result';
import { DataHandler } from '../../../src/_shared/common/providers';
import { ExchangeRateService } from '../../../src/features/exchange-rates/exchange-rate.service';
import { PromotionConfigService } from '../../../src/features/promotion-configs/promotion-config.service';
import { PromotionConfigs, PromotionConfigsDocument } from '../../../src/features/promotion-configs/schemas';

describe('PromotionConfigService', () => {
    let promotionConfigService: PromotionConfigService;
    let model: Model<PromotionConfigsDocument>;
    const exchangeRateService = {
        getAll: jest.fn(),
        getExchangeRateById: jest.fn(),
    };
    const dataHandler = {
        getData: jest.fn(),
        updateData: jest.fn(),
    };
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PromotionConfigService,
                { provide: getModelToken(PromotionConfigs.name), useValue: Model },
                { provide: DataHandler, useValue: dataHandler },
                { provide: ExchangeRateService, useValue: exchangeRateService },
            ],
        }).compile();
        model = module.get<Model<PromotionConfigsDocument>>(getModelToken(PromotionConfigs.name));

        promotionConfigService = module.get<PromotionConfigService>(PromotionConfigService);
    });

    describe('getPromotionsByStatus', () => {
        it('should return data from model', async () => {
            // Arrange

            const entity = new PromotionConfigs();

            const spy = jest.spyOn(model, 'find').mockReturnValue({
                lean: function (): any {
                    return {
                        exec: async function () {
                            return [entity];
                        },
                    };
                },
            } as any);
            jest.spyOn(dataHandler, 'getData').mockReturnValue([entity]);

            // Act

            const actual = await promotionConfigService.getPromotionsByStatus('new');
            // Assert

            expect(actual).toStrictEqual([entity]);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('updatePromotionStatus', () => {
        it('should call update model', async () => {
            // Arrange
            const fixedDate = new Date('2025-03-17T03:30:42.500Z');
            jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as any);
            const filter = { promotionId: 1 };
            const updates = { status: 'running', updatedTime: fixedDate };
            // Act

            await promotionConfigService.updatePromotionStatus(filter.promotionId, updates.status);
            // Assert
            expect(dataHandler.updateData).toHaveBeenCalledWith(model, filter, updates);
            jest.restoreAllMocks();
        });
    });

    describe('getById', () => {
        it('should return successful when get data success', async () => {
            // Arrange
            const id = 1,
                currencyGroupId = '123';

            jest.spyOn(model, 'findOne').mockReturnValue({
                lean: function (): any {
                    return {
                        exec: async function () {
                            return jest.fn();
                        },
                    };
                },
            } as any);
            jest.spyOn(dataHandler, 'getData').mockReturnValue(new Result(0, '', []));
            // Act
            const actual = await promotionConfigService.getById(id, currencyGroupId);
            // Assert
            expect(actual.isSuccessful).toBeTruthy();
        });

        it('should not return successful when get data fail', async () => {
            // Arrange
            const id = 1,
                currencyGroupId = '123';

            jest.spyOn(model, 'findOne').mockReturnValue({
                lean: function (): any {
                    return {
                        exec: async function () {
                            return jest.fn();
                        },
                    };
                },
            } as any);
            jest.spyOn(dataHandler, 'getData').mockReturnValue(new Result(1, ''));
            // Act
            const actual = await promotionConfigService.getById(id, currencyGroupId);
            // Assert
            expect(actual.isSuccessful).toBeFalsy();
            expect(actual.data).toBeNull();
        });
    });

    describe('getBySession', () => {
        it('should return promotions when user site name is included ', async () => {
            // Arrange

            jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        lean: function (): any {
                            return {
                                exec: async function () {
                                    return jest.fn();
                                },
                            };
                        },
                    };
                },
            } as any);
            const promotions = [
                { promotionId: 1, name: 'promotion 1', operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: 'lumi1' }] },
                { promotionId: 2, name: 'promotion 2', operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: 'lumi1' }] },
                { promotionId: 3, name: 'promotion 3', operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: 'lumi2' }] },
            ];
            jest.spyOn(dataHandler, 'getData').mockReturnValue(new Result(0, '', promotions));
            // Act
            const actual = await promotionConfigService.getBySession(validSession.session);
            // Assert
            expect(actual.data.length).toBe(2);
        });

        it('should return all promotions when operator included site names is empty', async () => {
            // Arrange

            jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        lean: function (): any {
                            return {
                                exec: async function () {
                                    return jest.fn();
                                },
                            };
                        },
                    };
                },
            } as any);
            const promotions = [
                { promotionId: 1, name: 'promotion 1', operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: '' }] },
                { promotionId: 2, name: 'promotion 2', operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: '' }] },
                { promotionId: 3, name: 'promotion 3', operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: '' }] },
            ];
            jest.spyOn(dataHandler, 'getData').mockReturnValue(new Result(0, '', promotions));
            // Act
            const actual = await promotionConfigService.getBySession(validSession.session);
            // Assert
            expect(actual.data.length).toBe(3);
        });
    });

    describe('getPromotionsByNotifications', () => {
        it('should return promotions when promotion has notification', async () => {
            // Arrange

            jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        lean: function (): any {
                            return {
                                exec: async function () {
                                    return jest.fn();
                                },
                            };
                        },
                    };
                },
            } as any);

            const promotions = [
                {
                    _id: '1',
                    promotionId: 1,
                    name: 'promotion 1',
                    operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: 'lumi1', currencyGroups: [] }],
                    startDateTime: new Date(),
                    endDateTime: new Date(),
                    winningPrizes: [],
                    updatedTime: new Date(),
                    status: '',
                    exId: 1
                },
                {
                    _id: '2',
                    promotionId: 2,
                    name: 'promotion 2',
                    operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: 'lumi1', currencyGroups: [] }],
                    startDateTime: new Date(),
                    endDateTime: new Date(),
                    winningPrizes: [],
                    updatedTime: new Date(),
                    status: '',
                    exId: 2
                },
                {
                    _id: '3',
                    promotionId: 3,
                    name: 'promotion 3',
                    operators: [{ operatorId: 'ONEworksVGCash', includedSiteNames: 'lumi2', currencyGroups: [] }],
                    startDateTime: new Date(),
                    endDateTime: new Date(),
                    winningPrizes: [],
                    updatedTime: new Date(),
                    status: '',
                    exId: 3
                },
            ];

            const notifications: Notifications[] = [
                {
                    promotionId: '1',
                    title: { 'en-US': 'message promotion 1', 'vi-VN': '', 'zh-CN': '', 'zh-TW': '', 'th-TH': '', 'id-ID': '' },
                    messages: { 'en-US': 'message promotion 1', 'vi-VN': '', 'zh-CN': '', 'zh-TW': '', 'th-TH': '', 'id-ID': '' },
                    time: new Date(),
                    displayKind: 4,
                    enabled: true,
                    startTime: new Date(),
                    endTime: new Date(),
                },
                {
                    promotionId: '2',
                    title: { 'en-US': 'message promotion 1', 'vi-VN': '', 'zh-CN': '', 'zh-TW': '', 'th-TH': '', 'id-ID': '' },
                    messages: { 'en-US': 'message promotion 1', 'vi-VN': '', 'zh-CN': '', 'zh-TW': '', 'th-TH': '', 'id-ID': '' },
                    time: new Date(),
                    displayKind: 4,
                    enabled: true,
                    startTime: new Date(),
                    endTime: new Date(),
                },
            ];

            // Act
            const actual = promotionConfigService.getPromotionsByNotifications(promotions, notifications);

            // Assert
            expect(actual.length).toBe(2);
        });
    });

    describe('getPromotionDetail', () => {
        it('should return view model has correct data', async () => {
            // Arrange

            jest.spyOn(exchangeRateService, 'getExchangeRateById').mockReturnValue(Promise.resolve(new Result(0, '', exchangeRates)));
            const promotion = {
                _id: '1',
                promotionId: 1,
                name: 'promotion 1',
                operators: [
                    {
                        operatorId: 'ONEworksVGCash',
                        includedSiteNames: 'lumi1',
                        currencyGroups: [
                            {
                                currencyGroupId: '61765beed2b6510001f18bd6',
                                otherGameMinBet: 2,
                                slotGameMinBet: 0.2,
                                enabled: true,
                            },
                        ],
                    },
                ],
                startDateTime: new Date(),
                endDateTime: new Date(),
                winningPrizes: [
                    { ranking: '1', value: 20000000 },
                    { ranking: '2', value: 10000000 },
                    { ranking: '3', value: 5000000 },
                    { ranking: '4-6', value: 2000000 },
                ],
                updatedTime: new Date(),
                status: '',
                exId: 1
            };
            const title = 'promotion test';

            // Act
            const actual = await promotionConfigService.getPromotionDetail(promotion, validSession.session, title);

            // Assert
            expect(actual.title).toBe(title);
            expect(actual.totalPrize).toBe(41000);
            expect(actual.winningPrizes[3].from).toBe(4);
            expect(actual.winningPrizes[3].to).toBe(6);
            expect(actual.winningPrizes[2].value).toBe(5000);
            expect(actual.numerousPrize).toBe(6);
        });
    });
});
