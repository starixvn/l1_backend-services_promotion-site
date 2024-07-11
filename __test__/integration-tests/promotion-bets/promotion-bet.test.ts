import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { setupDatabase } from '../_stubs/setup-database';
import { getBearerToken } from '../_stubs/helper';
import { Result } from 'src/_shared/common/models/result';
import { PromotionBets } from 'src/features/promotion-bets/schemas';

jest.setTimeout(10000);
describe('Promotion', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;

    beforeEach(async () => {
        moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        await setupDatabase(moduleFixture);
    });

    it('/promotion-bet(GET)', async () => {
        // Act
        const token = ''; //await getBearerToken();
        const result = await request(app.getHttpServer()).get('/promotion-bet').set('Authorization', token);

        // Assert
        const model = JSON.parse(result.text) as Result<PromotionBets[]>;
        expect(result.status).toBe(200);
        expect(model.data[0].promotionId).toEqual(1);
    });
});
