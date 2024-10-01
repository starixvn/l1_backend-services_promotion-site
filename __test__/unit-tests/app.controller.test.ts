import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { UserService } from '../../src/features/users/services/user.service';
import { PromotionConfigService } from '../../src/features/promotion-configs/promotion-config.service';
import { Model } from 'mongoose';
import { PromotionConfigs, PromotionConfigsDocument } from '../../src/features/promotion-configs/schemas';
import { getModelToken } from '@nestjs/mongoose';
import { DataHandler } from '../../src/_shared/common/providers';
import { ExchangeRateService } from '../../src/features/exchange-rates/exchange-rate.service';

describe('AppController', () => {
    let appController: AppController;
    let model: Model<PromotionConfigsDocument>;
    const exchangeRateService = {
        getAll: jest.fn(),
        getExchangeRateById: jest.fn(),
    };
    const dataHandler = {
        getData: jest.fn(),
        updateData: jest.fn(),
    };

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                AppService,
                UserService,
                PromotionConfigService,
                { provide: getModelToken(PromotionConfigs.name), useValue: Model },
                { provide: DataHandler, useValue: dataHandler },
                { provide: ExchangeRateService, useValue: exchangeRateService },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('root', () => {
        it('should return "App is running!"', () => { });
    });
});
