import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { ExchangeRates, ExchangeRatesDocument } from './schemas';
import { SentryLogger } from '../../_shared/common/providers';

@Injectable()
export class ExchangeRateService {
    constructor(
        @InjectModel(ExchangeRates.name) private readonly model: Model<ExchangeRatesDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
        @Inject(SentryLogger) private readonly logger: SentryLogger
    ) { }

    async getExchangeRateById(exId: number): Promise<Result<ExchangeRates>> {
        this.logger.warn(`exId: ${exId}, call exId: ${exId > 0}`);
        const execution = exId > 0 ?
            this.model.findOne({ exId }).lean().exec() :
            this.model.findOne({}).sort({ exDate: -1 }).lean().exec();

        return this.dataHandler.getData(execution);
    }
}
