import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceClient } from '../../../src/_shared/services/user-service';
import { AppModule } from '../../../src/app.module';
import { PromotionProcessor } from '../../../src/features/cron-jobs/promotion-processor';
import { PromotionBetModule } from '../../../src/features/promotion-bets/promotion-bet.module';
import { setupDatabase } from '../_stubs/setup-database';

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

        // Act
        await promotionProcessor.proceed();
    });
});
