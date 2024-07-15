import { Injectable } from '@nestjs/common';

import { UserServiceClient } from '../../../../src/_shared/services/user-service';
import { VerifySessionRequest } from '../models';

@Injectable()
export class UserClientService {

    async getSession(request: VerifySessionRequest) {
        return await UserServiceClient.getSession(request.sessionId, request.username, request.browserUserAgent);
    }
}
