import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { VerifySessionRequest, VerifySessionResult } from '../models';
import { UserSession, UserSessionDocument } from '../schemas/user-session.schema';

@Injectable()
export class UserSessionsService {
    private readonly sessionTimeoutInMinutes = 19.8;

    constructor(@InjectModel(UserSession.name) private readonly model: Model<UserSessionDocument>) {}

    async getUserSession(sessionId: string): Promise<UserSession> {
        const a = await this.model.findOne({playerId:"666"}).lean().exec();
        return this.model.findOne({ sessionId: sessionId }).lean().exec();
    }

    async verifySession(request: VerifySessionRequest) {
        const userSession = await this.getUserSession(request.session);
        const a = this.model.find({ sessionId: request.session }).lean().exec();
        const isValid =
            userSession && userSession.username === request.username && userSession.browserUserAgent === request.browserUserAgent;
        const isSessionExpired = this.isSessionExpired(userSession);

        return new VerifySessionResult(isValid && !isSessionExpired, userSession);
    }

    private isSessionExpired(userSession: UserSession) {
        if (!userSession) {
            return true;
        }

        const differenceInMinutes = Math.abs(Date.now() - userSession.recheckInTime.getTime()) / (1000 * 60);

        return differenceInMinutes > this.sessionTimeoutInMinutes;
    }
}
