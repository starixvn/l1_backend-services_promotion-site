import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';

import { GameConfigs, GameConfigsDocument } from './schemas';
import { DataHandler, SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class GameConfigService {
    constructor(
        @InjectModel(GameConfigs.name) private readonly model: Model<GameConfigsDocument>,
        @Inject(DataHandler) private readonly dataHandler: DataHandler,
    ) {}

    async getAll(): Promise<Result<GameConfigs[]>> {
        const execution = this.model.find().lean().exec();
        return this.dataHandler.getData(execution);
    }
}
