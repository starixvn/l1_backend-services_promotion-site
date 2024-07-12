import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { setupDatabase } from '../_stubs/setup-database';
import { PromotionProcessor } from '../../../src/features/cron-jobs/promotion-processor';
import { PromotionBetModule } from '../../../src/features/promotion-bets/promotion-bet.module';

jest.setTimeout(100000);
describe('Promotion', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;
    let promotionProcessor: PromotionProcessor;

    beforeEach(async () => {
        moduleFixture = await Test.createTestingModule({
            imports: [AppModule, PromotionBetModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        await setupDatabase(moduleFixture);
        promotionProcessor = app.get(PromotionProcessor);
    });

    it('work', async () => {
        // Act

        // Act
        await promotionProcessor.proceed();
    });
});
