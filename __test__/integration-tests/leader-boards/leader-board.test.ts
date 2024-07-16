import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { Result } from 'src/_shared/common/models/result';
import { PromotionLeaderBoards } from 'src/features/promotion-leader-boards/schemas';
import * as request from 'supertest';
import { UserServiceClient } from '../../../src/_shared/services/user-service';
import { AppModule } from '../../../src/app.module';
import { setupDatabase } from '../_stubs/setup-database';

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
        UserServiceClient.init();

        await app.getHttpAdapter().getInstance().ready();
        await setupDatabase(moduleFixture);
    });

    it('/leader-board (GET)', async () => {
        // Act
        const token = ''; //await getBearerToken();
        const result = await request(app.getHttpServer()).get('/leader-board?promotionId=1').set('Authorization', token);

        // Assert
        const model = JSON.parse(result.text) as Result<PromotionLeaderBoards[]>;
        expect(result.status).toBe(200);
        expect(model.data[0].playerId).toEqual(9931920);
    });
});
