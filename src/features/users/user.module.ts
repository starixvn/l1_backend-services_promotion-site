import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSessionsService } from './services/user-session.service';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: UserSession.name, schema: UserSessionSchema, collection: 'usersessions' }])],
    providers: [UserSessionsService],
    exports: [UserSessionsService],
})
export class UserModule {}
