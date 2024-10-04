import { Injectable } from '@nestjs/common';

import { ErrorCodes, Result } from '../../../_shared/common/models/result';
import { UserServiceClient, UserSession } from '../../../_shared/services/user-service';
import { VerifySessionRequest } from '../models';

@Injectable()
export class UserService {
    async getUserSession(request: VerifySessionRequest): Promise<Result<UserSession>> {
        const { isAuthenticated, session } = await UserServiceClient.getSession(
            request.sessionId,
            request.username,
            request.browserUserAgent,
        );
        console.log(`getSession isAuthenticated: ${isAuthenticated}`);


        if (!isAuthenticated) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
        }

        console.log(`getSession session.disableAward: ${session.disableAward}`);
        if (session.disableAward) {
            return new Result(ErrorCodes.Failed, 'User is disable award');
        }
        return new Result(ErrorCodes.Success, '', session);
    }
}
