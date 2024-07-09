import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { setupDatabase } from '../_stubs/setup-database';
import { getBearerToken } from '../_stubs/helper';
import { PromotionLeaderBoards } from 'src/leader-boards/schemas';
import { Result } from 'src/common/models/result';

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

    it('/leader-board (GET)', async () => {
        // Act
        const token = ''; //await getBearerToken();
        console.log('token', token);
        const result = await request(app.getHttpServer())
            .get('/leader-board?promotionId=668ca45229c4a627515ed81a')
            .set('Authorization', token);

        // Assert
        const model = JSON.parse(result.text) as Result<PromotionLeaderBoards[]>;
        expect(result.status).toBe(200);
        expect(model.data[0].playerId).toEqual(9931920);
    });
});
