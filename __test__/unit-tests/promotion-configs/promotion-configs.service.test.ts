import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { validSession } from '../../../__test__/integration-tests/_stubs/helper';
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
            const filter = { promotionId: 1 };
            const updates = { status: 'running', updatedTime: new Date() };

            // Act

            await promotionConfigService.updatePromotionStatus(filter.promotionId, updates.status);
            // Assert
            expect(dataHandler.updateData).toHaveBeenCalledWith(model, filter, updates);
        });
    });

    describe('getById', () => {
        it('result is successful when get data success', async () => {
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
            const result = await promotionConfigService.getById(id, currencyGroupId);
            // Assert
            expect(result.isSuccessful).toBeTruthy();
        });

        it('result is not successful when get data fail', async () => {
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
            const result = await promotionConfigService.getById(id, currencyGroupId);
            // Assert
            expect(result.isSuccessful).toBeFalsy();
            expect(result.data).toBeNull();
        });
    });

    describe('getBySession', () => {
        it('result has promotions which site name is included ', async () => {
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
                { promotionId: 1, name: 'promotion 1', operators: [{ includedSiteNames: 'lumi1' }] },
                { promotionId: 2, name: 'promotion 2', operators: [{ includedSiteNames: 'lumi1' }] },
                { promotionId: 3, name: 'promotion 3', operators: [{ includedSiteNames: 'lumi2' }] },
            ];
            jest.spyOn(dataHandler, 'getData').mockReturnValue(new Result(0, '', promotions));
            // Act
            const result = await promotionConfigService.getBySession(validSession.session);
            // Assert
            expect(result.data.length).toBe(2);
        });

        it('result has all promotions which included site name empty', async () => {
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
                { promotionId: 1, name: 'promotion 1', operators: [{ includedSiteNames: '' }] },
                { promotionId: 2, name: 'promotion 2', operators: [{ includedSiteNames: '' }] },
                { promotionId: 3, name: 'promotion 3', operators: [{ includedSiteNames: '' }] },
            ];
            jest.spyOn(dataHandler, 'getData').mockReturnValue(new Result(0, '', promotions));
            // Act
            const result = await promotionConfigService.getBySession(validSession.session);
            // Assert
            expect(result.data.length).toBe(3);
        });
    });
});
