import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { Result } from 'src/_shared/common/models/result';
import { PromotionConfigs } from 'src/features/promotion-configs/schemas';
import * as request from 'supertest';
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
        await app.getHttpAdapter().getInstance().ready();
        await setupDatabase(moduleFixture);
    });

    it('/promotion-config (GET)', async () => {
        // Act
        const token = ''; //await getBearerToken();
        console.log('token', token);
        const result = await request(app.getHttpServer()).get('/promotion-config').set('Authorization', token);

        // Assert
        const model = JSON.parse(result.text) as Result<PromotionConfigs[]>;
        expect(result.status).toBe(200);
        expect(model.data[0].name).toEqual('Weekly Promotion');
    });

    it('/promotion-config/getPromotionsBySession (GET)', async () => {
        // Act
        const token = ''; //await getBearerToken();
        console.log('token', token);
        const result = await request(app.getHttpServer())
            .get('/promotion-config/getPromotionsBySession/61765beed2b6510001f18bd6')
            .set('Authorization', token);

        // Assert
        const model = JSON.parse(result.text) as Result<PromotionConfigs>;
        expect(result.status).toBe(200);
        expect(model.data.name).toEqual('Weekly Promotion');
    });
});
