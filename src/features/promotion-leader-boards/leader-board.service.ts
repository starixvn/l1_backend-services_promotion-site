import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PromotionLeaderBoards, PromotionLeaderBoardsDocument } from './schemas';
import { SentryLogger } from '../../_shared/common/providers';
import { ErrorCodes, ErrorMessages, Result } from '../../_shared/common/models/result';

@Injectable()
export class LeaderBoardService {
    constructor(
        @InjectModel(PromotionLeaderBoards.name) private readonly model: Model<PromotionLeaderBoardsDocument>,
        private readonly logger: SentryLogger,
    ) {}

    async getLeaderBoard(promotionId: string): Promise<Result<PromotionLeaderBoards[]>> {
        try {
            const data = (await this.model.find({ promotionId }).lean().exec()) as PromotionLeaderBoards[];
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, data);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }
}
