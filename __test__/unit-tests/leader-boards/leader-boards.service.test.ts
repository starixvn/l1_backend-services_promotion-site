import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { exchangeRates, leaderBoards, validSession } from '../../../__test__/integration-tests/_stubs/helper';
import { Result } from '../../../src/_shared/common/models/result';
import { DataHandler, SentryLogger } from '../../../src/_shared/common/providers';
import { ExchangeRateService } from '../../../src/features/exchange-rates/exchange-rate.service';
import { PromotionConfigService } from '../../../src/features/promotion-configs/promotion-config.service';
import { LeaderBoardService } from '../../../src/features/promotion-leader-boards/leader-board.service';
import { LeaderBoardItemViewModel, you } from '../../../src/features/promotion-leader-boards/models/leader-board-response';
import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from '../../../src/features/promotion-leader-boards/schemas';
import { PromotionConfigsDocument } from 'src/features/promotion-configs/schemas';

describe('LeaderBoardService', () => {
    let leaderBoardService: LeaderBoardService;
    let promotionConfigModel: Model<PromotionConfigsDocument>;
    let model: Model<PromotionLeaderBoardsDocument>;
    const exchangeRateService = {
        getAll: jest.fn(),
        getExchangeRateById: jest.fn(),
    };
    const sentryLogger = {
        warn: jest.fn(),
    };

    const promotionConfigService = {
        getAll: jest.fn(),
        getExchangeRateById: jest.fn(),
        getByPromotionId: jest.fn(),
    };

    const dataHandler = {
        getData: jest.fn(),
        updateData: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LeaderBoardService,
                { provide: getModelToken(PromotionLeaderBoards.name), useValue: Model },
                { provide: DataHandler, useValue: dataHandler },
                { provide: ExchangeRateService, useValue: exchangeRateService },
                { provide: PromotionConfigService, useValue: promotionConfigService },
                { provide: SentryLogger, useValue: sentryLogger },
            ],
        }).compile();
        model = module.get<Model<PromotionLeaderBoardsDocument>>(getModelToken(PromotionLeaderBoards.name));

        leaderBoardService = module.get<LeaderBoardService>(LeaderBoardService);
    });

    describe('getLeaderBoard', () => {
        it('should return correct data', async () => {
            // Arrange

            jest.spyOn(leaderBoardService, 'getTopLeaderBoardByPromotionId').mockReturnValue(
                Promise.resolve([new LeaderBoardItemViewModel('member1', 100), new LeaderBoardItemViewModel('member2', 50)]),
            );
            jest.spyOn(leaderBoardService, 'getPlayerLeaderBoardByPromotionId').mockReturnValue(
                Promise.resolve({ rank: 2, ...new LeaderBoardItemViewModel(you, 50) }),
            );

            const promotionId = 1;
            // Act

            const actual = await leaderBoardService.getLeaderBoard(promotionId, validSession.session);
            // Assert

            expect(actual.currentUser.nickName).toStrictEqual(you);
            expect(actual.leadBoardItems[0].point).toStrictEqual(100);
            expect(actual.leadBoardItems[0].nickName).toStrictEqual('m***er1');
            expect(actual.leadBoardItems[1].point).toStrictEqual(50);
            expect(actual.leadBoardItems[1].nickName).toStrictEqual(you);
        });
    });

    describe('getLeaderBoard', () => {
        it('should return correct data when current session is test currency', async () => {
            // Arrange

            jest.spyOn(leaderBoardService, 'getTopLeaderBoardByPromotionId').mockReturnValue(
                Promise.resolve([new LeaderBoardItemViewModel('member1', 100.12), new LeaderBoardItemViewModel('member2', 50.123)]),
            );
            jest.spyOn(leaderBoardService, 'getPlayerLeaderBoardByPromotionId').mockReturnValue(
                Promise.resolve({ rank: 0, ...new LeaderBoardItemViewModel(you, 100) }),
            );

            const promotionId = 1;
            // Act

            const actual = await leaderBoardService.getLeaderBoard(promotionId, { ...validSession.session, isTestCurrency: true });
            // Assert

            expect(actual.leadBoardItems[0].point).toStrictEqual(100.12);
            expect(actual.leadBoardItems[0].nickName).toStrictEqual('m***er1');
            expect(actual.leadBoardItems[1].point).toStrictEqual(50.13);
            expect(actual.leadBoardItems[1].nickName).toStrictEqual('m***er2');
            expect(actual.currentUser.nickName).toStrictEqual(you);
            expect(actual.currentUser.rank).toStrictEqual(0);
        });
    });

    describe('getTopLeaderBoardByPromotionId', () => {
        it('should return correct data', async () => {
            // Arrange

            jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        limit: function (): any {
                            return {
                                lean: function (): any {
                                    return {
                                        exec: async function () {
                                            return leaderBoards;
                                        },
                                    };
                                },
                            };
                        },
                    };
                },
            } as any);

            jest.spyOn(promotionConfigService, 'getByPromotionId').mockReturnValue(Promise.resolve(new Result(0, '', {
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
            })));
            jest.spyOn(exchangeRateService, 'getExchangeRateById').mockReturnValue(Promise.resolve(new Result(0, '', exchangeRates)));
            jest.spyOn(leaderBoardService, 'getPlayerLeaderBoardByPromotionId').mockReturnValue(
                Promise.resolve({ rank: 2, ...new LeaderBoardItemViewModel(you, 50) }),
            );

            const promotionId = 1;
            // Act

            const actual = await leaderBoardService.getTopLeaderBoardByPromotionId(promotionId, validSession.session);
            // Assert

            expect(actual[0].point).toStrictEqual(100);
            expect(actual[1].point).toStrictEqual(50);
            expect(actual[0].nickName).toStrictEqual('m***er1');
            expect(actual[1].nickName).toStrictEqual('m***er2');
            expect(model.find).toHaveBeenCalledWith({ isTestCurrency: false, promotionId });
        });
    });

    describe('getPlayerLeaderBoardByPromotionId', () => {
        it('should return correct data', async () => {
            // Arrange

            jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        lean: function (): any {
                            return {
                                count: function (): any {
                                    return {
                                        exec: async function () {
                                            return 1;
                                        },
                                    };
                                },
                            };
                        },
                    };
                },
            } as any);

            jest.spyOn(model, 'findOne').mockReturnValue({
                lean: function (): any {
                    return {
                        exec: async function () {
                            return leaderBoards[1];
                        },
                    };
                },
            } as any);

            const promotionId = 1;
            // Act

            const actual = await leaderBoardService.getPlayerLeaderBoardByPromotionId(promotionId, validSession.session);
            // Assert

            expect(actual.point).toStrictEqual(50);
            expect(actual.nickName).toStrictEqual(you);
            expect(actual.rank).toStrictEqual(2);
            expect(model.findOne).toHaveBeenCalledWith({ playerId: validSession.session.playerId, promotionId });
            expect(model.find).toHaveBeenCalledWith({ isTestCurrency: false, promotionId, pointInBaseCurrency: { $gt: 50000 } });
        });
    });
    describe('getPlayerLeaderBoardByPromotionId', () => {
        it('should return correct data when user is test currency', async () => {
            // Arrange

            jest.spyOn(model, 'findOne').mockReturnValue({
                lean: function (): any {
                    return {
                        exec: async function () {
                            return leaderBoards[2];
                        },
                    };
                },
            } as any);

            const promotionId = 1;
            // Act

            const actual = await leaderBoardService.getPlayerLeaderBoardByPromotionId(promotionId, validSession.session);
            // Assert

            expect(actual.point).toStrictEqual(50);
            expect(actual.nickName).toStrictEqual(you);
            expect(actual.rank).toStrictEqual(0);
            expect(model.findOne).toHaveBeenCalledWith({ playerId: validSession.session.playerId, promotionId });
        });
    });
});
