import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types, Decimal128 } from 'mongoose';
import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from '../../../src/leader-boards/schemas';

export const setupDatabase = async (moduleFixture: TestingModule) => {
    await initLeaderBoard(moduleFixture);
};

const initLeaderBoard = async (moduleFixture: TestingModule) => {
    const model = moduleFixture.get(getModelToken('PromotionLeaderBoards')) as Model<PromotionLeaderBoardsDocument>;

    // Clear
    await model.deleteMany({});

    // Insert
    const item = new PromotionLeaderBoards();
    item.promotionId = '668ca45229c4a627515ed81a';
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
