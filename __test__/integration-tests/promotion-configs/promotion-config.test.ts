import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Result } from '../../../src/_shared/common/models/result';
import { UserServiceClient } from '../../../src/_shared/services/user-service';
import { AppModule } from '../../../src/app.module';
import { PromotionDetailViewModel, PromotionViewModel } from '../../../src/features/promotion-configs/models/promotion-configs-response';
import { validSession } from '../_stubs/helper';
import { setupDatabase } from '../_stubs/setup-database';

jest.setTimeout(3 * 10000);
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

    it('/promotions getByUserSession(POST)', async () => {
        //Arrange
        jest.spyOn(UserServiceClient, 'getSession').mockResolvedValue(validSession);

        // Act
        const token = ''; //await getBearerToken();

        const result = await request(app.getHttpServer()).post('/promotions').set('Authorization', token);

        // Assert
        const model = JSON.parse(result.text) as Result<PromotionViewModel[]>;
        expect(result.status).toBe(201);
        expect(model.data[0].title).toEqual('Weekly Promotion');
    });

    it('/promotions/:id getById(POST)', async () => {
        //Arrange
        jest.spyOn(UserServiceClient, 'getSession').mockResolvedValue(validSession);

        // Act
        const token = ''; //await getBearerToken();

        const result = await request(app.getHttpServer()).post('/promotions/1').set('Authorization', token);

        // Assert
        const model = JSON.parse(result.text) as Result<PromotionDetailViewModel>;
        expect(result.status).toBe(201);
        expect(model.data.title).toEqual('Weekly Promotion');
    });
});
