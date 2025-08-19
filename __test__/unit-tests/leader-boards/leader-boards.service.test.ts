import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { exchangeRates, leaderBoards, validSession } from '../../../__test__/integration-tests/_stubs/helper';
import { Result } from '../../../src/_shared/common/models/result';
import { DataHandler, SentryLogger } from '../../../src/_shared/common/providers';
import { ExchangeRateService } from '../../../src/features/exchange-rates/exchange-rate.service';
import { PromotionConfigService } from '../../../src/features/promotion-configs/promotion-config.service';
import { PROMOTION_STATUSES } from '../../../src/features/promotion-configs/schemas';
import { LeaderBoardService } from '../../../src/features/promotion-leader-boards/leader-board.service';
import { LeaderBoardItemViewModel, you } from '../../../src/features/promotion-leader-boards/models/leader-board-response';
import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from '../../../src/features/promotion-leader-boards/schemas';
import { PromotionConfigsDocument } from '../../../src/features/promotion-configs/schemas';
import { UserSession } from '../../../src/features/users/schemas';

describe('LeaderBoardService', () => {
    let leaderBoardService: LeaderBoardService;
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
        bulkWrite: jest.fn(),
        deleteMany: jest.fn(),
        getDataAndUpdate: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

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

        it('should handle custom top limit', async () => {
            // Arrange
            const findMock = jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        limit: function (limit: number): any {
                            expect(limit).toBe(5);
                            return {
                                lean: function (): any {
                                    return {
                                        exec: async function () {
                                            return leaderBoards.slice(0, 2);
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
                exId: 1
            })));

            jest.spyOn(exchangeRateService, 'getExchangeRateById').mockReturnValue(Promise.resolve(new Result(0, '', exchangeRates)));

            const promotionId = 1;
            const customTop = 5;

            // Act
            const actual = await leaderBoardService.getTopLeaderBoardByPromotionId(promotionId, validSession.session, customTop);

            // Assert
            expect(actual.length).toBe(2);
            expect(findMock).toHaveBeenCalledWith({ isTestCurrency: false, promotionId });
        });
    });

    describe('getPlayerLeaderBoardByPromotionId', () => {
        it('should return correct data for standard player', async () => {
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

        it('should return correct data for SabaPlay operator', async () => {
            // Arrange
            const sabaPlaySession: UserSession = {
                ...validSession.session,
                operatorId: 'SabaPlay',
                playerId: 'SBP~12345'
            };

            jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        lean: function (): any {
                            return {
                                count: function (): any {
                                    return {
                                        exec: async function () {
                                            return 3;
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
                            return {
                                ...leaderBoards[1],
                                pointInBaseCurrency: 25000,
                                point: 25
                            };
                        },
                    };
                },
            } as any);

            const promotionId = 1;

            // Act
            const actual = await leaderBoardService.getPlayerLeaderBoardByPromotionId(promotionId, sabaPlaySession);

            // Assert
            expect(actual.point).toStrictEqual(25);
            expect(actual.nickName).toStrictEqual(you);
            expect(actual.rank).toStrictEqual(4);
            expect(model.findOne).toHaveBeenCalledWith({ playerId: '12345', promotionId });
            expect(model.find).toHaveBeenCalledWith({ isTestCurrency: false, promotionId, pointInBaseCurrency: { $gt: 25000 } });
        });

        it('should handle SabaPlay operator when playerId has no tilde separator', async () => {
            // Arrange
            const sabaPlaySession: UserSession = {
                ...validSession.session,
                operatorId: 'SabaPlay',
                playerId: '12345'  // No tilde
            };

            jest.spyOn(model, 'findOne').mockReturnValue({
                lean: function (): any {
                    return {
                        exec: async function () {
                            return {
                                ...leaderBoards[1],
                                pointInBaseCurrency: 25000,
                                point: 25
                            };
                        },
                    };
                },
            } as any);

            jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        lean: function (): any {
                            return {
                                count: function (): any {
                                    return {
                                        exec: async function () {
                                            return 0;
                                        },
                                    };
                                },
                            };
                        },
                    };
                },
            } as any);

            const promotionId = 1;

            // Act
            const actual = await leaderBoardService.getPlayerLeaderBoardByPromotionId(promotionId, sabaPlaySession);

            // Assert
            expect(actual.rank).toStrictEqual(1);
            expect(model.findOne).toHaveBeenCalledWith({ playerId: '12345', promotionId });
        });

        it('should handle player not in leaderboard', async () => {
            // Arrange
            jest.spyOn(model, 'findOne').mockReturnValue({
                lean: function (): any {
                    return {
                        exec: async function () {
                            return null;
                        },
                    };
                },
            } as any);

            const promotionId = 1;

            // Act
            const actual = await leaderBoardService.getPlayerLeaderBoardByPromotionId(promotionId, validSession.session);

            // Assert
            expect(actual.point).toStrictEqual(0);
            expect(actual.nickName).toStrictEqual(you);
            expect(actual.rank).toStrictEqual(0);
            expect(model.findOne).toHaveBeenCalledWith({ playerId: validSession.session.playerId, promotionId });
        });

        it('should handle test currency players', async () => {
            // Arrange
            jest.spyOn(model, 'findOne').mockReturnValue({
                lean: function (): any {
                    return {
                        exec: async function () {
                            return leaderBoards[2]; // This is a test currency player
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

    describe('getTopLeaderBoard', () => {
        it('should return top leaderboard entries', async () => {
            // Arrange
            const mockResults = [...leaderBoards.slice(0, 2)];
            const findMock = jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        limit: function (): any {
                            return {
                                lean: function (): any {
                                    return {
                                        exec: jest.fn(),
                                    };
                                },
                            };
                        },
                    };
                },
            } as any);

            dataHandler.getData.mockResolvedValue(new Result(0, '', mockResults));

            const promotionId = 1;
            const limit = 10;

            // Act
            const result = await leaderBoardService.getTopLeaderBoard(promotionId, limit);

            // Assert
            expect(result.data).toEqual(mockResults);
            expect(findMock).toHaveBeenCalledWith({ isTestCurrency: false, promotionId });
            expect(dataHandler.getData).toHaveBeenCalled();
        });
    });

    describe('getTopLeaderBoardWithTestCurrency', () => {
        it('should return leaderboard entries including test currency', async () => {
            // Arrange
            const mockResults = [...leaderBoards];
            const findMock = jest.spyOn(model, 'find').mockReturnValue({
                sort: function (): any {
                    return {
                        limit: function (): any {
                            return {
                                lean: function (): any {
                                    return {
                                        exec: jest.fn(),
                                    };
                                },
                            };
                        },
                    };
                },
            } as any);

            dataHandler.getData.mockResolvedValue(new Result(0, '', mockResults));

            const promotionId = 1;
            const limit = 10;

            // Act
            const result = await leaderBoardService.getTopLeaderBoardWithTestCurrency(promotionId, limit);

            // Assert
            expect(result.data).toEqual(mockResults);
            expect(findMock).toHaveBeenCalledWith({ promotionId }); // No isTestCurrency filter
            expect(dataHandler.getData).toHaveBeenCalled();
        });
    });

    describe('updateAwardAmount', () => {
        it('should update award amount correctly', async () => {
            // Arrange
            const leaderBoard = leaderBoards[0];
            const amount = 1000;
            const awardedInPlayerCurrency = 500;

            dataHandler.getDataAndUpdate.mockResolvedValue(new Result(0, '', { ...leaderBoard, awardedAmountInBaseCurrency: amount, awardedAmount: awardedInPlayerCurrency }));

            // Act
            const result = await leaderBoardService.updateAwardAmount(leaderBoard, amount, awardedInPlayerCurrency);

            // Assert
            expect(dataHandler.getDataAndUpdate).toHaveBeenCalledWith(
                model,
                { promotionId: leaderBoard.promotionId, operatorId: leaderBoard.operatorId, playerId: leaderBoard.playerId },
                { awardedAmountInBaseCurrency: amount, awardedAmount: awardedInPlayerCurrency, updatedTime: expect.any(Date) }
            );
            expect(result.data.awardedAmountInBaseCurrency).toBe(amount);
            expect(result.data.awardedAmount).toBe(awardedInPlayerCurrency);
        });
    });

    describe('updateChecksumPoint', () => {
        it('should update checksum point correctly', async () => {
            // Arrange
            const leaderBoard = leaderBoards[0];
            const checksumPoint = 200;

            dataHandler.getDataAndUpdate.mockResolvedValue(new Result(0, '', { ...leaderBoard, checksumPoint }));

            // Act
            const result = await leaderBoardService.updateChecksumPoint(leaderBoard, checksumPoint);

            // Assert
            expect(dataHandler.getDataAndUpdate).toHaveBeenCalledWith(
                model,
                { promotionId: leaderBoard.promotionId, operatorId: leaderBoard.operatorId, playerId: leaderBoard.playerId },
                { checksumPoint, updatedTime: expect.any(Date) }
            );
            expect(result.data.checksumPoint).toBe(checksumPoint);
        });
    });

    describe('getLatestDataSourceTimeStamp', () => {
        it('should return the latest data source timestamp', async () => {
            // Arrange
            const timestamp = new Date();
            const findOneMock = jest.spyOn(model, 'findOne').mockReturnValue({
                sort: function (): any {
                    return {
                        lean: function (): any {
                            return {
                                exec: jest.fn(),
                            };
                        },
                    };
                },
            } as any);

            dataHandler.getData.mockResolvedValue(new Result(0, '', { dataSourceTimeStamp: timestamp }));

            const promotionId = 1;

            // Act
            const result = await leaderBoardService.getLatestDataSourceTimeStamp(promotionId);

            // Assert
            expect(result).toEqual(timestamp);
            expect(findOneMock).toHaveBeenCalledWith({ promotionId });
            expect(dataHandler.getData).toHaveBeenCalled();
        });

        it('should handle when no data is found', async () => {
            // Arrange
            jest.spyOn(model, 'findOne').mockReturnValue({
                sort: function (): any {
                    return {
                        lean: function (): any {
                            return {
                                exec: jest.fn(),
                            };
                        },
                    };
                },
            } as any);

            dataHandler.getData.mockResolvedValue(new Result(0, '', null));

            const promotionId = 1;

            // Act
            const result = await leaderBoardService.getLatestDataSourceTimeStamp(promotionId);

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('bulkWrite', () => {
        it('should bulk write leaderboard entries correctly', async () => {
            // Arrange
            const mockLeaderBoards = [
                { ...leaderBoards[0], dataSourceTimeStamp: new Date() },
                { ...leaderBoards[1], dataSourceTimeStamp: new Date() }
            ];

            dataHandler.bulkWrite.mockResolvedValue(new Result(0, '', { modifiedCount: 2 }));

            // Act
            const result = await leaderBoardService.bulkWrite(mockLeaderBoards as PromotionLeaderBoards[]);

            // Assert
            expect(dataHandler.bulkWrite).toHaveBeenCalledWith(
                model,
                expect.arrayContaining([
                    expect.objectContaining({
                        updateOne: expect.objectContaining({
                            filter: expect.objectContaining({
                                promotionId: mockLeaderBoards[0].promotionId,
                                operatorId: mockLeaderBoards[0].operatorId,
                                playerId: mockLeaderBoards[0].playerId,
                            })
                        })
                    }),
                    expect.objectContaining({
                        updateOne: expect.objectContaining({
                            filter: expect.objectContaining({
                                promotionId: mockLeaderBoards[1].promotionId,
                                operatorId: mockLeaderBoards[1].operatorId,
                                playerId: mockLeaderBoards[1].playerId,
                            })
                        })
                    })
                ])
            );
            expect(result.data).toEqual({ modifiedCount: 2 });
        });
    });

    describe('clearToRecalculate', () => {
        it('should clear leaderboard when conditions are met', async () => {
            // Arrange
            const promotionId = 1;
            const secret = 'key3z4cjfn';
            const now = new Date();
            const tenMinutesLater = new Date(now.getTime() + 20 * 60 * 1000);

            promotionConfigService.getByPromotionId.mockResolvedValue(new Result(0, '', {
                promotionId,
                status: PROMOTION_STATUSES.running,
                endDateTime: tenMinutesLater
            }));

            dataHandler.deleteMany.mockResolvedValue({ acknowledged: true, deletedCount: 10 });

            // Act
            await leaderBoardService.clearToRecalculate(promotionId, secret);

            // Assert
            expect(promotionConfigService.getByPromotionId).toHaveBeenCalledWith(promotionId);
            expect(dataHandler.deleteMany).toHaveBeenCalledWith(model, { promotionId });
            expect(sentryLogger.warn).toHaveBeenCalledWith(`clear leaderboard to recalculate for promotionId ${promotionId}`);
        });

        it('should not clear leaderboard when secret is wrong', async () => {
            // Arrange
            const promotionId = 1;
            const wrongSecret = 'wrongSecret';

            // Act
            await leaderBoardService.clearToRecalculate(promotionId, wrongSecret);

            // Assert
            expect(promotionConfigService.getByPromotionId).not.toHaveBeenCalled();
            expect(dataHandler.deleteMany).not.toHaveBeenCalled();
            expect(sentryLogger.warn).not.toHaveBeenCalled();
        });

        it('should not clear leaderboard when promotion status is not running', async () => {
            // Arrange
            const promotionId = 1;
            const secret = 'key3z4cjfn';

            promotionConfigService.getByPromotionId.mockResolvedValue(new Result(0, '', {
                promotionId,
                status: PROMOTION_STATUSES.completed,
                endDateTime: new Date(Date.now() + 60 * 60 * 1000)
            }));

            // Act
            await leaderBoardService.clearToRecalculate(promotionId, secret);

            // Assert
            expect(promotionConfigService.getByPromotionId).toHaveBeenCalledWith(promotionId);
            expect(dataHandler.deleteMany).not.toHaveBeenCalled();
            expect(sentryLogger.warn).not.toHaveBeenCalled();
        });

        it('should not clear leaderboard when end time is too close', async () => {
            // Arrange
            const promotionId = 1;
            const secret = 'key3z4cjfn';
            const now = new Date();
            const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

            promotionConfigService.getByPromotionId.mockResolvedValue(new Result(0, '', {
                promotionId,
                status: PROMOTION_STATUSES.running,
                endDateTime: fiveMinutesLater
            }));

            // Act
            await leaderBoardService.clearToRecalculate(promotionId, secret);

            // Assert
            expect(promotionConfigService.getByPromotionId).toHaveBeenCalledWith(promotionId);
            expect(dataHandler.deleteMany).not.toHaveBeenCalled();
            expect(sentryLogger.warn).not.toHaveBeenCalled();
        });
    });
});
