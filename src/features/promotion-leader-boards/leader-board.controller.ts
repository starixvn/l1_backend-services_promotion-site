import { Body, Controller, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../../src/_shared/common/models/result';
import { UserService } from '../users/services/user.service';
import { LeaderBoardService } from './leader-board.service';
import { LeaderBoardResponse } from './models/leader-board-response';
import { UserAgent } from '../decorator/user-agent.decorator';

@ApiTags('leader-board')
@Controller('leader-board')
export class LeaderBoardController {
    constructor(
        private readonly service: LeaderBoardService,
        @Inject(UserService) private readonly userClientService: UserService,
    ) { }

    @Post('/:promotionId')
    @ApiOperation({ operationId: 'getLeaderBoard' })
    @ApiOkResponse({ type: LeaderBoardResponse })
    async getLeaderBoard(
        @Param('promotionId') promotionId: number,
        @Body('sessionId') sessionId: string,
        @Body('username') username: string,
        @UserAgent() browserUserAgent: string,
    ): Promise<LeaderBoardResponse> {
        const verifySession = await this.userClientService.getUserSession({
            sessionId,
            username,
            browserUserAgent,
        });

        if (!verifySession.isSuccessful) {
            return new Result(ErrorCodes.Failed, verifySession.errorMessage);
        }

        return new Result(ErrorCodes.Success, '', await this.service.getLeaderBoard(promotionId, verifySession.data));
    }

    @Post('/clearToRecalculate/:promotionId')
    @ApiOperation({ operationId: 'clearToRecalculate' })
    @ApiOkResponse({ type: LeaderBoardResponse })
    async clearToRecalculate(@Param('promotionId') promotionId: number, @Query('secret') secret: string): Promise<Result<void>> {
        console.log('clearToRecalculate', promotionId, secret);
        const result = await this.service.clearToRecalculate(promotionId, secret);

        return new Result(ErrorCodes.Success, '', result);
    }
}
