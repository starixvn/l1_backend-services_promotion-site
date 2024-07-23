import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { Result } from 'src/_shared/common/models/result';
import * as request from 'supertest';
import { UserServiceClient } from '../../../src/_shared/services/user-service';
import { AppModule } from '../../../src/app.module';
import { LeaderBoardViewModel } from '../../../src/features/promotion-leader-boards/models/leader-board-response';
import { validSession } from '../_stubs/helper';
import { setupDatabase } from '../_stubs/setup-database';

jest.setTimeout(3 * 10000);
describe('LeaderBoard', () => {
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

    it('/leader-board/:promotionId getLeaderBoard(POST)', async () => {
        //Arrange
        jest.spyOn(UserServiceClient, 'getSession').mockResolvedValue(validSession);

        // Act
        const token = ''; //await getBearerToken();
        const result = await request(app.getHttpServer()).post('/leader-board/1').set('Authorization', token);

        // Assert
        const model = JSON.parse(result.text) as Result<LeaderBoardViewModel>;
        expect(result.status).toBe(201);
        expect(model.data.currentUser.point).toEqual(1);
    });
});
