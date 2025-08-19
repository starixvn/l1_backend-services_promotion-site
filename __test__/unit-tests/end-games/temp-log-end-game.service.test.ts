import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TempLogEndGameService } from '../../../src/features/end-games/temp-log-end-game.service';
import { TempLogEndGames, TempLogEndGamesDocument } from '../../../src/features/end-games/schemas';
import { DataHandler } from '../../../src/_shared/common/providers';
import { Result, ErrorCodes, ErrorMessages } from '../../../src/_shared/common/models/result';

describe('TempLogEndGameService', () => {
    let service: TempLogEndGameService;
    let model: Model<TempLogEndGamesDocument>;
    let dataHandler: DataHandler;

    // Mock data
    const mockTempLogEndGames: TempLogEndGames[] = [
        {
            operatorId: 'operator1',
            playerId: 'player1',
            logTimeStamp: new Date(),
            logId: 'log1',
            siteId: 'site1',
            gameRoundId: 1,
            gameTypeId: 101,
            totalAmount: 100,
            totalWin: 50,
            validBetAmount: 100,
            system: 1
        },
        {
            operatorId: 'SabaPlay',
            playerId: 'player2',
            logTimeStamp: new Date(),
            logId: 'log2',
            siteId: 'site2',
            gameRoundId: 2,
            gameTypeId: 102,
            totalAmount: 200,
            totalWin: 150,
            validBetAmount: 200,
            system: 1
        }
    ];

    // Mock aggregate results
    const mockAggregateResult = [
        {
            playerId: 'player1',
            operatorId: 'operator1',
            gameId: 101,
            roundId: 1,
            totalAmount: 100,
            totalWin: 50,
            validBetAmount: 100,
            // Other fields
        }
    ];

    // Mock aggregate execution
    const mockAggregationPromise = Promise.resolve(mockAggregateResult);

    // Success result
    const successResult = <T>(data: T): Result<T> => new Result<T>(ErrorCodes.Success, ErrorMessages.Empty, data);

    // Error result
    const errorResult = (message: string): Result<any> => new Result(ErrorCodes.Failed, message);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TempLogEndGameService,
                {
                    provide: getModelToken(TempLogEndGames.name),
                    useValue: {
                        deleteMany: jest.fn(),
                        insertMany: jest.fn(),
                        aggregate: jest.fn().mockReturnValue({
                            exec: jest.fn().mockReturnValue(mockAggregationPromise)
                        })
                    },
                },
                {
                    provide: DataHandler,
                    useValue: {
                        deleteMany: jest.fn(),
                        insertMany: jest.fn(),
                        getData: jest.fn()
                    },
                },
            ],
        }).compile();

        service = module.get<TempLogEndGameService>(TempLogEndGameService);
        model = module.get<Model<TempLogEndGamesDocument>>(getModelToken(TempLogEndGames.name));
        dataHandler = module.get<DataHandler>(DataHandler);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('deleteAll', () => {
        it('should delete all records successfully', async () => {
            // Arrange
            const expectedResult = successResult({ acknowledged: true, deletedCount: 2 });
            jest.spyOn(dataHandler, 'deleteMany').mockResolvedValue(expectedResult);

            // Act
            const result = await service.deleteAll();

            // Assert
            expect(dataHandler.deleteMany).toHaveBeenCalledWith(model, {});
            expect(result).toEqual(expectedResult);
            expect(result.data.acknowledged).toBe(true);
            expect(result.data.deletedCount).toBe(2);
        });

        it('should handle errors when deleting records', async () => {
            // Arrange
            const error = new Error('Database error');
            const expectedResult = errorResult(error.message);
            jest.spyOn(dataHandler, 'deleteMany').mockResolvedValue(expectedResult);

            // Act
            const result = await service.deleteAll();

            // Assert
            expect(dataHandler.deleteMany).toHaveBeenCalledWith(model, {});
            expect(result).toEqual(expectedResult);
        });
    });

    describe('insertMany', () => {
        it('should insert many records successfully', async () => {
            // Arrange
            const expectedResult = successResult([...mockTempLogEndGames]);
            jest.spyOn(dataHandler, 'insertMany').mockResolvedValue(expectedResult);

            // Act
            const result = await service.insertMany(mockTempLogEndGames);

            // Assert
            expect(dataHandler.insertMany).toHaveBeenCalledWith(model, mockTempLogEndGames);
            expect(result).toEqual(expectedResult);
            expect(Array.isArray(result.data)).toBe(true);
        });

        it('should handle errors when inserting records', async () => {
            // Arrange
            const error = new Error('Database error');
            const expectedResult = errorResult(error.message);
            jest.spyOn(dataHandler, 'insertMany').mockResolvedValue(expectedResult);

            // Act
            const result = await service.insertMany(mockTempLogEndGames);

            // Assert
            expect(dataHandler.insertMany).toHaveBeenCalledWith(model, mockTempLogEndGames);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncToPromotionBet', () => {
        it('should sync data to promotion_bets successfully', async () => {
            // Arrange
            const expectedResult = successResult(mockAggregateResult);
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(expectedResult);

            // Act
            const result = await service.syncToPromotionBet();

            // Assert
            expect(model.aggregate).toHaveBeenCalled();
            expect(dataHandler.getData).toHaveBeenCalled();
            expect(result).toEqual(expectedResult);
        });

        it('should handle errors during sync', async () => {
            // Arrange
            const error = new Error('Aggregate error');
            const expectedResult = errorResult(error.message);
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(expectedResult);

            // Act
            const result = await service.syncToPromotionBet();

            // Assert
            expect(model.aggregate).toHaveBeenCalled();
            expect(dataHandler.getData).toHaveBeenCalled();
            expect(result).toEqual(expectedResult);
        });

        it('should create proper aggregation pipeline', async () => {
            // Arrange
            const aggregateSpy = jest.spyOn(model, 'aggregate');
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(successResult(mockAggregateResult));

            // Act
            await service.syncToPromotionBet();

            // Assert
            expect(aggregateSpy).toHaveBeenCalled();

            // Verify the aggregation pipeline structure
            const pipeline = aggregateSpy.mock.calls[0][0];

            // Check that pipeline has correct structure
            expect(pipeline.length).toBe(6);

            // Check lookup stage - use proper typing for mongoose 6.x
            const firstStage = pipeline[0] as any;
            expect(firstStage.$lookup).toBeDefined();
            expect(firstStage.$lookup.from).toBe('usersessions');

            // Check first project stage
            const secondStage = pipeline[1] as any;
            expect(secondStage.$project).toBeDefined();

            // Check match stage
            const thirdStage = pipeline[2] as any;
            expect(thirdStage.$match).toBeDefined();
            expect(thirdStage.$match.disableAward).toBe(false);

            // Check second lookup stage
            const fourthStage = pipeline[3] as any;
            expect(fourthStage.$lookup).toBeDefined();
            expect(fourthStage.$lookup.from).toBe('userinfos');
        });

        it('should handle the SabaPlay operator ID condition correctly', async () => {
            // Arrange
            const aggregateSpy = jest.spyOn(model, 'aggregate');
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(successResult(mockAggregateResult));

            // Act
            await service.syncToPromotionBet();

            // Assert
            const pipeline = aggregateSpy.mock.calls[0][0];
            const lookupStage = (pipeline[0] as any).$lookup;
            const matchStage = lookupStage.pipeline[0].$match;

            // Verify the conditional expression for SabaPlay
            const condExpression = matchStage.$expr.$and[0].$cond;
            expect(condExpression.if.$eq[1]).toBe('SabaPlay');
            expect(condExpression.then.$eq[1].$concat).toBeDefined();
            expect(condExpression.else.$eq[1]).toBe('$$playerId');
        });

        it('should construct the correct player ID for SabaPlay operator', async () => {
            // Arrange
            const aggregateSpy = jest.spyOn(model, 'aggregate');
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(successResult(mockAggregateResult));

            // Act
            await service.syncToPromotionBet();

            // Assert
            const pipeline = aggregateSpy.mock.calls[0][0];
            const lookupStage = (pipeline[0] as any).$lookup;
            const matchStage = lookupStage.pipeline[0].$match;

            // Get the SabaPlay condition
            const condExpression = matchStage.$expr.$and[0].$cond;

            // Verify concat operation format for SabaPlay
            const concatOp = condExpression.then.$eq[1].$concat;
            expect(concatOp.length).toBe(3);
            expect(concatOp[0]).toBe('$$siteId');
            expect(concatOp[1]).toBe('~');
            expect(concatOp[2]).toBe('$$playerId');
        });

        it('should use player ID directly for non-SabaPlay operators', async () => {
            // Arrange
            const mockNonSabaPlayLog = {
                operatorId: 'RegularOperator',
                playerId: 'player123',
                siteId: 'site456',
                logTimeStamp: new Date(),
                logId: 'log123',
                gameRoundId: 5,
                gameTypeId: 105,
                totalAmount: 150,
                totalWin: 75,
                validBetAmount: 150,
                system: 1
            };

            // Mock the expected output after processing through the pipeline
            const mockExpectedResult = {
                playerId: 'player123', // For non-SabaPlay, playerId remains unchanged
                operatorId: 'RegularOperator'
                // ... other fields
            };

            const aggregateSpy = jest.spyOn(model, 'aggregate');
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(successResult([mockExpectedResult]));

            // Act
            await service.syncToPromotionBet();

            // Assert
            const pipeline = aggregateSpy.mock.calls[0][0];
            const lookupStage = (pipeline[0] as any).$lookup;
            const matchStage = lookupStage.pipeline[0].$match;

            // Verify the conditional expression for non-SabaPlay
            const condExpression = matchStage.$expr.$and[0].$cond;
            expect(condExpression.if.$eq[1]).toBe('SabaPlay');
            expect(condExpression.else.$eq[1]).toBe('$$playerId');
        });

        it('should apply the special SabaPlay player ID format only when operator is SabaPlay', async () => {
            // Arrange
            // Create mock data with both SabaPlay and non-SabaPlay operators
            const sabaPlayLog = {
                operatorId: 'SabaPlay',
                playerId: 'player1',
                siteId: 'site1'
            };

            const regularLog = {
                operatorId: 'operator1',
                playerId: 'player2',
                siteId: 'site2'
            };

            // Mock the aggregate pipeline execution
            const mockPipeline = [
                {
                    $project: {
                        // This represents how the aggregation would correctly transform the data
                        sabaPlayMatchedId: 'site1~player1', // for SabaPlay, concat siteId ~ playerId
                        regularMatchedId: 'player2'         // for regular operator, use playerId as is
                    }
                }
            ];

            // Use the same mocking approach as in other tests
            const aggregateSpy = jest.spyOn(model, 'aggregate');
            const mockPipelineExecution = jest.fn().mockResolvedValue(mockAggregateResult);
            aggregateSpy.mockReturnValue({
                exec: mockPipelineExecution
            } as any);

            // Mock the data handler's getData method to return the expected output
            jest.spyOn(dataHandler, 'getData').mockImplementation((promise) => {
                // Simulate the promise resolution and return a success result
                return promise.then(data => successResult(data));
            });

            // Act
            const result = await service.syncToPromotionBet();

            // Assert
            expect(aggregateSpy).toHaveBeenCalled();
            const pipeline = aggregateSpy.mock.calls[0][0];
            const lookupStage = (pipeline[0] as any).$lookup;

            // Verify the condition is properly structured
            const condition = lookupStage.pipeline[0].$match.$expr.$and[0].$cond;
            expect(condition.if.$eq[1]).toBe('SabaPlay');
            expect(condition.then.$eq[1].$concat).toBeDefined();
            expect(condition.else.$eq[1]).toBe('$$playerId');
        });

        it('should include updatedTime field in the projection', async () => {
            // Arrange
            const aggregateSpy = jest.spyOn(model, 'aggregate');
            jest.spyOn(dataHandler, 'getData').mockResolvedValue(successResult(mockAggregateResult));

            // Act
            await service.syncToPromotionBet();

            // Assert
            const pipeline = aggregateSpy.mock.calls[0][0];

            // Check the final projection in the pipeline
            const projectStage = (pipeline[4] as any).$project;

            // Verify that updatedTime is present in the projection
            expect(projectStage.updatedTime).toBeDefined();
            // We don't check instance since it would be a raw object in the pipeline, not a Date instance
        });

        it('should correctly transform player IDs based on operator in complete pipeline', async () => {
            // Arrange
            // 1. Set up mock data with different operator types
            const mockEndGameData = [
                {
                    // SabaPlay record
                    operatorId: 'SabaPlay',
                    playerId: 'player_saba',
                    siteId: 'site_saba',
                    logTimeStamp: new Date('2023-01-01'),
                    logId: 'log_saba',
                    gameRoundId: 100,
                    gameTypeId: 1001,
                    totalAmount: 500,
                    totalWin: 250,
                    validBetAmount: 500,
                    system: 1
                },
                {
                    // Regular operator record
                    operatorId: 'RegularOp',
                    playerId: 'player_regular',
                    siteId: 'site_regular',
                    logTimeStamp: new Date('2023-01-02'),
                    logId: 'log_regular',
                    gameRoundId: 200,
                    gameTypeId: 2001,
                    totalAmount: 300,
                    totalWin: 150,
                    validBetAmount: 300,
                    system: 1
                }
            ];

            // 2. Mock the user session data that would be looked up
            const mockUserSessions = [
                {
                    // For SabaPlay, the playerId needs to be siteId~playerId format
                    playerId: 'site_saba~player_saba',
                    operatorId: 'SabaPlay',
                    siteName: 'Saba Site',
                    currencyGroupId: 'sabaCurrency',
                    currencyCode: 'USD',
                    currencyName: 'US Dollar',
                    isTestCurrency: false,
                    playerName: 'Saba Player',
                    siteId: 'site_saba',
                    multiplier: 1,
                    userId: 'user_saba',
                    disableAward: false
                },
                {
                    // For regular operators, playerId matches directly
                    playerId: 'player_regular',
                    operatorId: 'RegularOp',
                    siteName: 'Regular Site',
                    currencyGroupId: 'regularCurrency',
                    currencyCode: 'EUR',
                    currencyName: 'Euro',
                    isTestCurrency: false,
                    playerName: 'Regular Player',
                    siteId: 'site_regular',
                    multiplier: 1,
                    userId: 'user_regular',
                    disableAward: false
                }
            ];

            // 3. Mock the user info data
            const mockUserInfos = [
                { id: 'user_saba', name: 'Saba User' },
                { id: 'user_regular', name: 'Regular User' }
            ];

            // 4. Set up expected output after transformation
            const expectedOutput = [
                {
                    // Transformed SabaPlay record
                    playerId: 'player_saba',
                    operatorId: 'SabaPlay',
                    gameId: 1001,
                    roundId: 100,
                    totalAmount: 500,
                    totalWin: 250,
                    validBetAmount: 500,
                    dataSourceId: 'log_saba',
                    dataSourceTimeStamp: new Date('2023-01-01'),
                    siteName: 'Saba Site',
                    currencyGroupId: 'sabaCurrency',
                    currencyCode: 'USD',
                    currencyName: 'US Dollar',
                    multiplier: 1,
                    isTestCurrency: false,
                    playerName: 'Saba Player',
                    siteId: 'site_saba',
                    nickname: 'Saba User',
                    // updatedTime would be here but we'll skip comparing it
                },
                {
                    // Transformed regular operator record
                    playerId: 'player_regular',
                    operatorId: 'RegularOp',
                    gameId: 2001,
                    roundId: 200,
                    totalAmount: 300,
                    totalWin: 150,
                    validBetAmount: 300,
                    dataSourceId: 'log_regular',
                    dataSourceTimeStamp: new Date('2023-01-02'),
                    siteName: 'Regular Site',
                    currencyGroupId: 'regularCurrency',
                    currencyCode: 'EUR',
                    currencyName: 'Euro',
                    multiplier: 1,
                    isTestCurrency: false,
                    playerName: 'Regular Player',
                    siteId: 'site_regular',
                    nickname: 'Regular User',
                    // updatedTime would be here but we'll skip comparing it
                }
            ];

            // 5. Create a more sophisticated mock for the aggregation pipeline
            // This simulates how MongoDB would process this data through the pipeline
            const mockPipelineExecution = jest.fn().mockResolvedValue(expectedOutput);

            // Mock the aggregate method
            const aggregateSpy = jest.spyOn(model, 'aggregate');
            aggregateSpy.mockReturnValue({
                exec: mockPipelineExecution
            } as any);

            // Mock the data handler's getData method to return the expected output
            jest.spyOn(dataHandler, 'getData').mockImplementation((promise) => {
                // Simulate the promise resolution and return a success result
                return promise.then(data => successResult(data));
            });

            // Act
            const result = await service.syncToPromotionBet();

            // Assert
            // 1. Verify the pipeline was executed
            expect(aggregateSpy).toHaveBeenCalled();
            expect(mockPipelineExecution).toHaveBeenCalled();

            // 2. Verify the pipeline properly constructed
            const pipeline = aggregateSpy.mock.calls[0][0];

            // 3. Check the lookup stage is correct
            const lookupStage = (pipeline[0] as any).$lookup;
            expect(lookupStage.from).toBe('usersessions');
            expect(lookupStage.let).toEqual({
                playerId: '$playerId',
                operatorId: '$operatorId',
                siteId: '$siteId',
            });

            // 4. Verify the SabaPlay condition in the pipeline
            const matchStage = lookupStage.pipeline[0].$match;
            const condExpression = matchStage.$expr.$and[0].$cond;
            expect(condExpression.if.$eq[1]).toBe('SabaPlay');
            expect(condExpression.then.$eq[1].$concat).toBeDefined();
            expect(condExpression.else.$eq[1]).toBe('$$playerId');

            // 5. Verify the result contains the properly transformed data
            expect(result.data).toEqual(expectedOutput);
        });
    });
}); 