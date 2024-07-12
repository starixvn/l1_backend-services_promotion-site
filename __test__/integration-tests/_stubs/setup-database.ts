import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
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
import { UserSession, UserSessionDocument } from '../../../src/features/users/schemas/user-session.schema';
import { PromotionRuns, PromotionRunsDocument } from '../../../src/features/promotion-runs/schemas/promotion-runs.schema';
import { TicketSilos, TicketSilosDocument } from '../../../src/features/ticket-silos/schemas/ticket-silos.schema';
import { ExchangeRates, ExchangeRatesDocument } from '../../../src/features/exchange-rates/schemas';
import { GameConfigs, GameConfigsDocument } from '../../../src/features/game-configs/schemas';

export const setupDatabase = async (moduleFixture: TestingModule) => {
    await initLeaderBoard(moduleFixture);
    await initPromotionConfig(moduleFixture);
    await initPromotionBet(moduleFixture);
    await initUserSession(moduleFixture);
    await initNotification(moduleFixture);
    await initPromotionRuns(moduleFixture);
    await initTicketSilos(moduleFixture);
    await initExchangeRate(moduleFixture);
    await initGameConfig(moduleFixture);
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

const createTicket = (playerId, roundId, stake, payout, currency) => {
    const item = new TicketSilos();
    item.roundTime = new Date();
    item.gameId = 2;
    item.operatorId = 'ONEworksVGCash';
    item.playerId = playerId;
    item.roundId = roundId;
    item.stake = stake;
    item.payout = payout;
    item.winloss = item.stake - item.payout;
    item.currency = currency;

    return item;
};

const initTicketSilos = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('TicketSilos')) as Model<TicketSilosDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const items = [
        createTicket('1', 1, 100, 200, 'VND'),
        createTicket('1', 2, 100, 50, 'VND'),
        createTicket('2', 1, 100, 200, 'USD'),
        createTicket('3', 2, 100, 50, 'THB'),
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
    item.operatorId = 'ONEworks1';
    item.playerId = '9931920';
    item.siteName = 'lumi';
    item.currencyGroupId = '61765beed2b6510001f18bd6';
    item.nickName = 'Onion3417';
    item.point = 100;
    item.latestPromotionBetId = '668cb02429c4a627515ed81e';
    item.updatedTime = new Date();
    item.currency = 'VND';
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
    operator1.operatorId = 'ONEworks1';
    operator1.excludedSiteNames = 'lumi1,lumi2';
    item.name = 'Weekly Promotion';

    const currencyGroup1 = new CurrencyGroup();
    currencyGroup1.currencyGroupId = '61765beed2b6510001f18bd6';
    currencyGroup1.slotGameMinBet = 0.2;
    currencyGroup1.otherGameMinBet = 2;
    currencyGroup1.enabled = true;
    operator1.currencyGroups = [currencyGroup1];
    item.operators = [operator1];
    item.startDateTime = new Date(new Date().setDate(new Date().getDate() - 2));
    item.endDateTime = new Date(new Date().setDate(new Date().getDate() + 2));
    const winningPrize1 = new WinningPrize();
    winningPrize1.name = '1st prize';
    winningPrize1.value = 1000;
    winningPrize1.quantity = 1;
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
    const item = new PromotionBets();
    item.promotionId = 1;
    item.operatorId = 'ONEworks1';
    item.playerId = 9931920;
    item.siteName = 'lumi';
    item.currencyGroupId = '61765beed2b6510001f18bd6';
    item.gameId = 1;
    item.roundId = 100;
    item.totalAmount = 100;
    item.totalWin = 200;
    item.endGameLogId = '66821f6484a90b840624fd6b';
    item.endGameLogTimeStamp = new Date();
    item.updatedTime = new Date();
    await model.insertMany([item]);
};

const createUserSession = (playerId, operatorId, currencyGroupId, siteName, ssoTime, random) => {
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
    return item;
};

const initUserSession = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('UserSession')) as Model<UserSessionDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const items = [
        createUserSession('1', 'ONEworksVGCash', '61765beed2b6510001f18bd6', 'lumi1', new Date(), 'xch5pum5k1K2Hjozkmgt404MnJjgAyg9'),
        createUserSession('2', 'ONEworksVGCash', '61765beed2b6510001f18bd6', 'lumi2', new Date(), 'xch5pum5k1K2Hjozkmgt404MnJjgAyg9'),
        createUserSession(
            '3',
            'ONEworksVGCash',
            '61765beed2b6510001f18bd6_1',
            'lumi3',
            new Date(new Date().setDate(new Date().getDate() - 1)),
            'xch5pum5k1K2Hjozkmgt404MnJjgAyg91',
        ),
        createUserSession('3', 'ONEworksVGCash', '61765beed2b6510001f18bd6_2', 'lumi3', new Date(), 'xch5pum5k1K2Hjozkmgt404MnJjgAyg92'),
    ];

    await model.insertMany(items);
};

const initNotification = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('Notifications')) as Model<NotificationsDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const item = new Notifications();
    item.displayKind = 4;
    item.enabled = true;

    item.messages = new Messages();
    item.messages['en-US'] = 'Promotion message';

    item.title = new Messages();
    item.title['en-US'] = 'Promotion Title';
    item.time = new Date();
    item.promotionId = 1;

    await model.insertMany([item]);
};
