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

    async getTicketWithUserInfos(startTime: Date, endTime: Date): Promise<Result<TicketSilos[]>> {
        const execution = this.model
            .aggregate([
                {
                    $match: {
                        roundTime: { $gte: startTime, $lte: endTime },
                    },
                },
                {
                    $lookup: {
                        from: 'usersessions',
                        let: {
                            playerId: '$playerId',
                            operatorId: '$operatorId',
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$playerId', '$$playerId'],
                                            },
                                            {
                                                $eq: ['$operatorId', '$$operatorId'],
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                $sort: { ssoTime: -1 },
                            },
                        ],
                        as: 'result',
                    },
                },
                {
                    $project: {
                        playerId: '$playerId',
                        operatorId: '$operatorId',
                        stake: '$stake',
                        payout: '$payout',
                        roundTime: '$roundTime',
                        gameId: '$gameId',
                        currency: '$currency',
                        siteName: { $arrayElemAt: ['$result.siteName', 0] },
                        currencyGroupId: { $arrayElemAt: ['$result.currencyGroupId', 0] },
                    },
                },
            ])
            .exec();
        return this.dataHandler.getData(execution);
    }
}
