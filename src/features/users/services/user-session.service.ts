import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserSession, UserSessionDocument } from '../schemas/user-session.schema';

@Injectable()
export class UserSessionsService {
    constructor(@InjectModel(UserSession.name) private readonly model: Model<UserSessionDocument>) {}

    async getUserSession(sessionId: string): Promise<UserSession> {
        return this.model.findOne({ sessionId: sessionId }).lean().exec();
    }
}
