import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ExchangeRates, ExchangeRatesDocument } from '../../../src/features/exchange-rates/schemas';
import { GameConfigs, GameConfigsDocument } from '../../../src/features/game-configs/schemas';
import { Messages, Notifications, NotificationsDocument } from '../../../src/features/notifications/schemas';
import { PromotionBets, PromotionBetsDocument } from '../../../src/features/promotion-bets/schemas';
import {
    CurrencyGroup,
    Operator,
    PromotionConfigs,
    PromotionConfigsDocument,
    WinningPrize,
} from '../../../src/features/promotion-configs/schemas';
import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from '../../../src/features/promotion-leader-boards/schemas';
import { PromotionRunsDocument } from '../../../src/features/promotion-runs/schemas/promotion-runs.schema';

export const setupDatabase = async (moduleFixture: TestingModule) => {
    await initLeaderBoard(moduleFixture);
    await initPromotionConfig(moduleFixture);
    await initPromotionBet(moduleFixture);
    await initNotification(moduleFixture);
    await initPromotionRuns(moduleFixture);
    await initExchangeRate(moduleFixture);
    await initGameConfig(moduleFixture);

    //await initBigData(moduleFixture);
};

const initBigData = async (moduleFixture: TestingModule) => {
    // Insert
    const createBet = (
        operatorId,
        playerId,
        nickname,
        siteName,
        currencyGroupId,
        totalAmount,
        totalWin,
        dataSourceId,
        dataSourceTimeStamp,
        roundId,
    ) => {
        const item = new PromotionBets();
        item.operatorId = operatorId;
        item.playerId = playerId;
        item.siteName = siteName;
        item.currencyGroupId = currencyGroupId;
        item.gameId = 1;
        item.roundId = roundId;
        item.totalAmount = totalAmount;
        item.totalWin = totalWin;
        item.validBetAmount = totalAmount;
        item.dataSourceId = dataSourceId;
        item.dataSourceTimeStamp = dataSourceTimeStamp;
        item.updatedTime = new Date();
        item.currencyCode = 'VND';
        item.currencyName = 'INH';
        item.nickname = nickname;
        item.multiplier = 1000;
        item.isTestCurrency = false;
        item.playerName = 'playername';
        item.siteId = '4100300';

        return item;
    };

    const randomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const startDate = new Date(new Date().setDate(new Date().getDate() - 10)).getTime();

    const betModel = moduleFixture.get(getModelToken('PromotionBets')) as Model<PromotionBetsDocument>;
    await betModel.deleteMany({});

    for (let batch = 0; batch < 10; batch++) {
        let items = [];
        for (let i = 0; i < 100_000; i++) {
            const index = batch * 100_000 + i;
            const playerId = randomInt(1, 10000);
            items.push(
                createBet(
                    'ONEworksVGCash',
                    playerId.toString(),
                    `p ${playerId}`,
                    'lumi1',
                    '61765beed2b6510001f18bd6',
                    100,
                    150,
                    '66821f6484a90b840624fd6b_1',
                    new Date(startDate + index * 100),
                    index + 1,
                ),
            );
        }

        await betModel.insertMany(items);
        console.log('inserted batch ', batch + 1, new Date().toISOString());
    }
};

const initGameConfig = async (moduleFixture: TestingModule) => {
    const createGameConfig = (gameId, type) => {
        const item = new GameConfigs();
        item.gameId = gameId;
        item.type = type;
        return item;
    };

    const model = moduleFixture.get(getModelToken('GameConfigs')) as Model<GameConfigsDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const items = [createGameConfig(2, 1), createGameConfig(2, 2), createGameConfig(2, 3), createGameConfig(3, 3)];

    await model.insertMany(items);
};

const initExchangeRate = async (moduleFixture: TestingModule) => {
    const createExchangeRate = (code) => {
        const item = new ExchangeRates();
        item.time = new Date();
        item.exDate = new Date();
        item.code = code;
        item.exId = 111;
        return item;
    };

    const model = moduleFixture.get(getModelToken('ExchangeRates')) as Model<ExchangeRatesDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const items = [
        createExchangeRate({
            VND: 1,
            USD: 23000,
            THB: 90,
        }),
        createExchangeRate({
            VND: 1.1,
            USD: 23000,
            THB: 90,
        }),
    ];

    await model.insertMany(items);
};

const initPromotionRuns = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('PromotionRuns')) as Model<PromotionRunsDocument>;

    // Clear
    await model.deleteMany({});
};

const initLeaderBoard = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('PromotionLeaderBoards')) as Model<PromotionLeaderBoardsDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const item = new PromotionLeaderBoards();
    item.promotionId = 1;
    item.operatorId = 'ONEworksVGCash';
    item.playerId = '1';
    item.siteName = 'lumi';
    item.currencyGroupId = '61765beed2b6510001f18bd6';
    item.nickName = 'Onion3417';
    item.point = 1;
    item.updatedTime = new Date();
    item.currency = 'INH';
    item.currencyCode = 'VND';
    item.multiplier = 1000;
    item.dataSourceTimeStamp = new Date();
    item.pointInBaseCurrency = 1000;
    item.isTestCurrency = false;
    item.playerName = 'playername';
    item.siteId = '4100300';
    await model.insertMany([item]);
};

const initPromotionConfig = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('PromotionConfigs')) as Model<PromotionConfigsDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const item = new PromotionConfigs();
    item.promotionId = 1;
    const operator1 = new Operator();
    operator1.operatorId = 'ONEworksVGCash';
    operator1.includedSiteNames = 'lumi;lumi1;lumi2';
    item.name = 'Weekly Promotion';

    const currencyGroup1 = new CurrencyGroup();
    currencyGroup1.currencyGroupId = '61765beed2b6510001f18bd6';
    currencyGroup1.slotGameMinBet = 0.2;
    currencyGroup1.otherGameMinBet = 2;
    currencyGroup1.enabled = true;
    const currencyGroup2 = new CurrencyGroup();
    currencyGroup2.currencyGroupId = '61765beed2b6510001f18bd6_2';
    currencyGroup2.slotGameMinBet = 0.2;
    currencyGroup2.otherGameMinBet = 2;
    currencyGroup2.enabled = true;
    operator1.currencyGroups = [currencyGroup1, currencyGroup2];
    item.operators = [operator1];
    item.startDateTime = new Date(new Date().setDate(new Date().getDate() - 2));
    item.endDateTime = new Date(new Date().setDate(new Date().getDate() + 2));
    const winningPrize1 = new WinningPrize();
    winningPrize1.value = 1000;
    winningPrize1.ranking = '1';
    item.winningPrizes = [winningPrize1];
    item.updatedTime = new Date();
    item.status = 'new';
    item.exId = 111;

    await model.insertMany([item]);
};

const initPromotionBet = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('PromotionBets')) as Model<PromotionBetsDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const createBet = (
        operatorId,
        playerId,
        nickname,
        siteName,
        currencyGroupId,
        totalAmount,
        totalWin,
        dataSourceId,
        dataSourceTimeStamp,
        roundId,
        currencyCode,
        currencyName,
    ) => {
        const item = new PromotionBets();
        item.operatorId = operatorId;
        item.playerId = playerId;
        item.siteName = siteName;
        item.currencyGroupId = currencyGroupId;
        item.gameId = 1;
        item.roundId = roundId;
        item.totalAmount = totalAmount;
        item.totalWin = totalWin;
        item.validBetAmount = totalAmount;
        item.dataSourceId = dataSourceId;
        item.dataSourceTimeStamp = dataSourceTimeStamp;
        item.updatedTime = new Date();
        item.currencyCode = currencyCode;
        item.currencyName = currencyName;
        item.nickname = nickname;
        item.multiplier = 1000;
        item.isTestCurrency = false;
        item.playerName = 'playername';
        item.siteId = '4100300';
        item.validBetAmount = 100;

        return item;
    };

    const items = [
        createBet(
            'ONEworksVGCash',
            1,
            'p1',
            'lumi1',
            '61765beed2b6510001f18bd6',
            100,
            200,
            '66821f6484a90b840624fd6b_1',
            new Date(new Date().setDate(new Date().getDate() - 1)),
            100,
            'VND',
            'INH',
        ),
        createBet(
            'ONEworksVGCash',
            1,
            'p1',
            'lumi1',
            '61765beed2b6510001f18bd6',
            100,
            150,
            '66821f6484a90b840624fd6b_1',
            new Date(),
            101,
            'VND',
            'INH',
        ),
        createBet(
            'ONEworksVGCash',
            2,
            'p2',
            'lumi1',
            '61765beed2b6510001f18bd6',
            100,
            150,
            '66821f6484a90b840624fd6b_1',
            new Date(),
            100,
            'VND',
            'INH',
        ),
        createBet(
            'ONEworksVGCash',
            3,
            'p3',
            'lumi1',
            '61765beed2b6510001f18bd6_2',
            100,
            150,
            '66821f6484a90b840624fd6b_1',
            new Date(),
            100,
            'USD',
            '$US',
        ),
    ];

    await model.insertMany(items);
};

const initNotification = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('Notifications')) as Model<NotificationsDocument>;
    const promotionModel = moduleFixture.get(getModelToken('PromotionConfigs')) as Model<PromotionConfigsDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const item = new Notifications();
    item.displayKind = 4;
    item.enabled = true;

    item.messages = new Messages();
    item.messages['en-US'] = 'Weekly Promotion Detail';

    item.title = new Messages();
    item.title['en-US'] = 'Weekly Promotion';
    item.time = new Date();
    item.promotionId = (await promotionModel.findOne({ promotionId: 1 }))._id;

    await model.insertMany([item]);
};
