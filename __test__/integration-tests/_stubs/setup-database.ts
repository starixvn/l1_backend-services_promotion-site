import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Call, EndGames, EndGamesDocument, EndGamesSchema } from '../../../src/features/end-games/schemas';
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
import { UserInfos, UserInfosDocument } from '../../../src/features/users/schemas';
import { UserSession, UserSessionDocument } from '../../../src/features/users/schemas/user-session.schema';

export const setupDatabase = async (moduleFixture: TestingModule) => {
    const startTime = new Date();
    await initLeaderBoard(moduleFixture);
    await initPromotionConfig(moduleFixture);
    await initPromotionBet(moduleFixture);
    await initUserSession(moduleFixture);
    await initUserInfo(moduleFixture);
    await initNotification(moduleFixture);
    await initPromotionRuns(moduleFixture);
    await initExchangeRate(moduleFixture);
    await initGameConfig(moduleFixture);
    await initEndGame(moduleFixture);

    //await initBigData(moduleFixture);
    //console.log('finish ', startTime.toISOString(), new Date().toISOString());
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

    const createUserInfo = (id, name) => {
        const item = new UserInfos();
        item.id = id;
        item.name = name;
    };

    const startDate = new Date(new Date().setDate(new Date().getDate() - 10)).getTime();

    const items = [];
    const userSessionItems = [];
    const userInfoItems = [];
    for (let i = 0; i < 50_000; i++) {
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
                new Date(startDate + i * 100),
                i + 1,
            ),
        );
        userSessionItems.push(
            createUserSession(
                playerId.toString(),
                'ONEworksVGCash',
                '61765beed2b6510001f18bd6',
                'lumi1',
                new Date(),
                `xch5pum5k1K2Hjozkmgt404MnJjgAyg9_${i.toString()}`,
                `u${playerId.toString()}`,
            ),
        );
        userInfoItems.push(createUserInfo(`u${playerId.toString()}`, `u${playerId.toString()}`));
    }

    const betModel = moduleFixture.get(getModelToken('PromotionBets')) as Model<PromotionBetsDocument>;
    await betModel.deleteMany({});
    await betModel.insertMany(items);

    const userSessionModel = moduleFixture.get(getModelToken('UserSession')) as Model<UserSessionDocument>;
    await userSessionModel.deleteMany({});
    await userSessionModel.insertMany(userSessionItems);

    const userInfoModel = moduleFixture.get(getModelToken('UserInfos')) as Model<UserInfosDocument>;
    await userInfoModel.deleteMany({});
    await userInfoModel.insertMany(userInfoItems);
};

const initEndGame = async (moduleFixture: TestingModule) => {
    const createEndGame = (operatorId, playerId, gameTypeId, gameRoundId) => {
        const item = new EndGames();
        item.operatorId = operatorId;
        item.logTimeStamp = new Date(new Date().setSeconds(new Date().getSeconds() + 15)).toDateString();
        const call = new Call();
        call.playerId = playerId;
        call.gameTypeId = gameTypeId;
        call.gameRoundId = gameRoundId;
        call.totalAmount = '100';
        call.totalWin = '150';
        item.call = call;
        item.system = 1;
        return item;
    };

    const model = moduleFixture.get(getModelToken('GameConfigs')) as Model<GameConfigsDocument>;
    const logDB = model.db.useDb('log');
    const endGameModel = logDB.model<EndGamesDocument>('end_games', EndGamesSchema as any);

    // Clear
    await endGameModel.deleteMany({});

    // Insert
    const items = [createEndGame('ONEworksVGCash', '500', '73', '123')];

    await endGameModel.insertMany(items);
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
    operator1.includedSiteNames = 'lumi,lumi1,lumi2';
    item.name = 'Weekly Promotion';

    const currencyGroup1 = new CurrencyGroup();
    currencyGroup1.currencyGroupId = '61765beed2b6510001f18bd6';
    currencyGroup1.slotGameMinBet = 0.2;
    currencyGroup1.otherGameMinBet = 2;
    currencyGroup1.enabled = true;
    operator1.currencyGroups = [currencyGroup1];
    item.operators = [operator1];
    item.startDateTime = new Date(new Date().setDate(new Date().getDate() - 12));
    item.endDateTime = new Date(new Date().setDate(new Date().getDate() + 2));
    const winningPrize1 = new WinningPrize();
    winningPrize1.value = 1000;
    winningPrize1.ranking = '1';
    item.winningPrizes = [winningPrize1];
    item.updatedTime = new Date();
    item.status = 'new';

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
        ),
        createBet('ONEworksVGCash', 1, 'p1', 'lumi1', '61765beed2b6510001f18bd6', 100, 150, '66821f6484a90b840624fd6b_1', new Date(), 101),
        createBet('ONEworksVGCash', 2, 'p2', 'lumi1', '61765beed2b6510001f18bd6', 100, 50, '66821f6484a90b840624fd6b_1', new Date(), 100),
        createBet('ONEworksVGCash', 3, 'p3', 'lumi1', '61765beed2b6510001f18bd6', 100, 150, '66821f6484a90b840624fd6b_1', new Date(), 100),
    ];

    await model.insertMany(items);
};

const createUserSession = (playerId, operatorId, currencyGroupId, siteName, ssoTime, random, id) => {
    const item = new UserSession();
    item.username = 'testUser';
    item.sessionId = `${random}_${operatorId}_${playerId}`;
    item.browserUserAgent = 'chrome';
    item.operatorId = operatorId;
    item.siteName = siteName;
    item.currencyGroupId = currencyGroupId;
    item.recheckInTime = new Date();
    item.playerId = playerId;
    item.ssoTime = ssoTime;
    item.currencyCode = 'VND';
    item.multiplier = 1000;
    item.id = id;
    item.userId = id;
    return item;
};

const initUserSession = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('UserSession')) as Model<UserSessionDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const items = [
        createUserSession('1', 'ONEworksVGCash', '61765beed2b6510001f18bd6', 'lumi1', new Date(), 'xch5pum5k1K2Hjozkmgt404MnJjgAyg9', '11'),
        createUserSession('2', 'ONEworksVGCash', '61765beed2b6510001f18bd6', 'lumi2', new Date(), 'xch5pum5k1K2Hjozkmgt404MnJjgAyg9', '22'),
        createUserSession(
            '3',
            'ONEworksVGCash',
            '61765beed2b6510001f18bd6_1',
            'lumi3',
            new Date(new Date().setDate(new Date().getDate() - 1)),
            'xch5pum5k1K2Hjozkmgt404MnJjgAyg91',
            '33',
        ),
        createUserSession(
            '3',
            'ONEworksVGCash',
            '61765beed2b6510001f18bd6_2',
            'lumi3',
            new Date(),
            'xch5pum5k1K2Hjozkmgt404MnJjgAyg92',
            '33',
        ),
        createUserSession(
            '500',
            'ONEworksVGCash',
            '61765beed2b6510001f18bd6_5',
            'lumi3',
            new Date(),
            'xch5pum5k1K2Hjozkmgt404MnJjgAyg92',
            '55',
        ),
    ];

    await model.insertMany(items);
};

const initUserInfo = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('UserInfos')) as Model<UserInfosDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const item = new UserInfos();
    item.id = '55';
    item.name = 'Hero';

    await model.insertMany([item]);
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
