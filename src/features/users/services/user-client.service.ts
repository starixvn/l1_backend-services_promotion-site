import { Injectable } from '@nestjs/common';

import { UserServiceClient, UserSession } from '../../../../src/_shared/services/user-service';
import { ErrorCodes, Result } from '../../../_shared/common/models/result';
import { VerifySessionRequest } from '../models';

@Injectable()
export class UserClientService {
    async getUserSession(request: VerifySessionRequest): Promise<Result<UserSession>> {
        const { isAuthenticated, session } = await UserServiceClient.getSession(
            request.sessionId,
            request.username,
            request.browserUserAgent,
        );
        if (!isAuthenticated) {
            return new Result(ErrorCodes.Failed, 'Session invalid');
        }

        if (session.disableAward) {
            return new Result(ErrorCodes.Failed, 'User is disable award');
        }
        return new Result(ErrorCodes.Success, '', session);
    }
}
