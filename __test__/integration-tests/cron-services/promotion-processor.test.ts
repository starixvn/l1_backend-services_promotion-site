import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceClient } from '../../../src/_shared/services/user-service';
import { AppModule } from '../../../src/app.module';
import { PromotionProcessor } from '../../../src/features/cron-jobs/promotion-processor';
import { PromotionBetModule } from '../../../src/features/promotion-bets/promotion-bet.module';
import { setupDatabase } from '../_stubs/setup-database';
import { getModelToken } from '@nestjs/mongoose';
import { PromotionLeaderBoardsDocument } from '../../../src/features/promotion-leader-boards/schemas';
import { Model } from 'mongoose';

jest.setTimeout(1000000);
describe('Promotion', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;
    let promotionProcessor: PromotionProcessor;

    beforeEach(async () => {
        moduleFixture = await Test.createTestingModule({
            imports: [AppModule, PromotionBetModule],
            providers: [UserServiceClient],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        await app.init();
        UserServiceClient.init();

        await app.getHttpAdapter().getInstance().ready();
        await setupDatabase(moduleFixture);
        promotionProcessor = app.get(PromotionProcessor);
    });

    it('work', async () => {
        // Act
        await promotionProcessor.proceed();

        // Assert
        const model = moduleFixture.get(getModelToken('PromotionLeaderBoards')) as Model<PromotionLeaderBoardsDocument>;
        const data = await model.find();
        expect(data.length).toBe(3);
        expect(data[0].playerId).toBe('1');
        expect(data[0].currencyGroupId).toBe('61765beed2b6510001f18bd6');
        expect(data[0].point).toBe(1.5);
        expect(data[0].pointInBaseCurrency).toBe(1500);
        expect(data[1].playerId).toBe('2');
        expect(data[1].currencyGroupId).toBe('61765beed2b6510001f18bd6');
        expect(data[1].point).toBe(0.5);
        expect(data[1].pointInBaseCurrency).toBe(500);
        expect(data[2].playerId).toBe('3');
        expect(data[2].currencyGroupId).toBe('61765beed2b6510001f18bd6_2');
        expect(data[2].point).toBe(0.5);
        expect(data[2].pointInBaseCurrency).toBe(11500000);
    });
});
