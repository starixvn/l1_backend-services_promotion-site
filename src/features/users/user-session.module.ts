import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSession, UserSessionSchema } from './schemas';
import { UserSessionsService } from './services/user-session.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: UserSession.name, schema: UserSessionSchema, collection: 'usersessions' }])],
    providers: [UserSessionsService],
    exports: [UserSessionsService],
})
export class UserSessionModule {}
