import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Result } from '../../_shared/common/models/result';
import { DataHandler } from '../../_shared/common/providers';
import { GameConfigs, GameConfigsDocument } from './schemas';

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
