import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TicketSilos, TicketSilosDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class TicketSiloService {
    constructor(
        @InjectModel(TicketSilos.name) private readonly model: Model<TicketSilosDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async getAll(): Promise<Result<TicketSilos[]>> {
        const execution = this.model.find({}).lean().exec();
        return this.dataHandler.getData(execution);
    }
}
