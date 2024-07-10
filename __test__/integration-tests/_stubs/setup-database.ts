import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types, Decimal128 } from 'mongoose';
import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from '../../../src/leader-boards/schemas';
import { CurrencyGroup, Operator, PromotionConfigs, PromotionConfigsDocument, WinningPrize } from '../../../src/promotion-configs/schemas';

export const setupDatabase = async (moduleFixture: TestingModule) => {
    await initLeaderBoard(moduleFixture);
    await initPromotionConfig(moduleFixture);
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
    item.time = new Date();
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
    currencyGroup1.status = 'enabled';
    operator1.currencyGroups = [currencyGroup1];
    item.operators = [operator1];
    item.startDateTime = new Date();
    item.endDateTime = new Date();
    const winningPrize1 = new WinningPrize();
    winningPrize1.name = '1st prize';
    winningPrize1.value = 1000;
    winningPrize1.quantity = 1;
    item.winningPrizes = [winningPrize1];
    item.time = new Date();

    await model.insertMany([item]);
};
