import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { ExchangeRates, ExchangeRatesDocument } from './schemas';

@Injectable()
export class ExchangeRateService {
    constructor(
        @InjectModel(ExchangeRates.name) private readonly model: Model<ExchangeRatesDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) { }

    async getExchangeRateById(exId: number): Promise<Result<ExchangeRates>> {
        const execution = this.model.findOne({ exId }).lean().exec();
        return this.dataHandler.getData(execution);
    }
}
