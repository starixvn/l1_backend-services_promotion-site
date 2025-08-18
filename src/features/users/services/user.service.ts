import { Injectable } from '@nestjs/common';

import { ErrorCodes, Result } from '../../../_shared/common/models/result';
import { UserServiceClient, UserSession } from '../../../_shared/services/user-service';
import { VerifySessionRequest } from '../models';

@Injectable()
export class UserService {
    async getUserSession(request: VerifySessionRequest, isNotCheckDisableAward = false): Promise<Result<UserSession>> {
        const { isAuthenticated, session } = await UserServiceClient.getSession(
            request.sessionId,
            request.username,
            request.browserUserAgent,
        );
        if (!isAuthenticated) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
        }

        if (session.disableAward && !isNotCheckDisableAward) {
            return new Result(ErrorCodes.Failed, 'User is disable award');
        }
        return new Result(ErrorCodes.Success, '', session);
    }
}
