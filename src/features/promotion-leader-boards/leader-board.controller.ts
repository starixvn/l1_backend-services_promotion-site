import { Body, Controller, Headers, Inject, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCodes, Result } from '../../../src/_shared/common/models/result';
import { UserClientService } from '../users/services/user-client.service';
import { LeaderBoardService } from './leader-board.service';
import { LeaderBoardResponse } from './models/leader-board-response';

@ApiTags('leader-board')
@Controller('leader-board')
export class LeaderBoardController {
    constructor(
        private readonly service: LeaderBoardService,
        @Inject(UserClientService) private readonly userClientService: UserClientService,
    ) { }

    @Post('/:promotionId')
    @ApiOperation({ operationId: 'getLeaderBoard' })
    @ApiOkResponse({ type: LeaderBoardResponse })
    async getLeaderBoard(
        @Param('promotionId') promotionId: number,
        @Body('sessionId') sessionId: string,
        @Body('username') username: string,
        @Headers('user-agent') browserUserAgent: string,
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
}
