import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSession, UserSessionSchema } from './schemas';
import { UserService } from './services/user.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: UserSession.name, schema: UserSessionSchema, collection: 'usersessions' }])],
    providers: [UserService],
    exports: [UserService],
})
export class UserClientServiceModule {}
