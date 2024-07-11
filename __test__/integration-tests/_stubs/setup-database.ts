import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
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

export const setupDatabase = async (moduleFixture: TestingModule) => {
    await initLeaderBoard(moduleFixture);
    await initPromotionConfig(moduleFixture);
    await initPromotionBet(moduleFixture);
    await initUserSession(moduleFixture);
};

const initLeaderBoard = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('PromotionLeaderBoards')) as Model<PromotionLeaderBoardsDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const item = new PromotionLeaderBoards();
    item.promotionId = 1;
    item.operatorId = 'ONEworks1';
    item.playerId = 9931920;
    item.siteName = 'lumi';
    item.currencyGroupId = '61765beed2b6510001f18bd6';
    item.nickName = 'Onion3417';
    item.point = 100;
    item.latestPromotionBetId = '668cb02429c4a627515ed81e';
    item.updatedTime = new Date();
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
    item.startDateTime = new Date();
    item.endDateTime = new Date();
    const winningPrize1 = new WinningPrize();
    winningPrize1.name = '1st prize';
    winningPrize1.value = 1000;
    winningPrize1.quantity = 1;
    item.winningPrizes = [winningPrize1];
    item.updatedTime = new Date();

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

const initUserSession = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('UserSession')) as Model<UserSessionDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const item = new UserSession();
    item.username = 'testUser';
    item.sessionId = 'xch5pum5k1K2Hjozkmgt404MnJjgAyg9_ONEworksVGCash_7364518';
    item.browserUserAgent = 'chrome';
    item.operatorId = 'ONEworks1';
    item.siteName = 'lumi';
    item.currencyGroupId = '61765beed2b6510001f18bd6';
    item.recheckInTime = new Date();

    await model.insertMany([item]);
};
