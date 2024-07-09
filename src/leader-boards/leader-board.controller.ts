import { Controller, Get, Query } from '@nestjs/common';
import { LeaderBoardService } from './leader-board.service';
import { PromotionLeaderBoards } from './schemas';
import { Result } from '../common/models/result';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeaderBoardResponse } from './models/leader-board-response';

@ApiTags('leader-board')
@Controller('leader-board')
export class LeaderBoardController {
    constructor(private readonly service: LeaderBoardService) {}

    @Get('/')
    @ApiOperation({ operationId: 'getLeaderBoard' })
    @ApiOkResponse({ type: LeaderBoardResponse })
    async getLeaderBoard(@Query('promotionId') promotionId: string): Promise<Result<PromotionLeaderBoards[]>> {
        return this.service.getLeaderBoard(promotionId);
    }
}
