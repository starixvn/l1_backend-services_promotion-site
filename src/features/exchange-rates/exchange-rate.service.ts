import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ExchangeRates, ExchangeRatesDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class ExchangeRateService {
    constructor(
        @InjectModel(ExchangeRates.name) private readonly model: Model<ExchangeRatesDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async getAll(): Promise<Result<ExchangeRates>> {
        const execution = this.model.findOne({}).sort({ exDate: -1 }).lean().exec();
        return this.dataHandler.getData(execution);
    }
}
