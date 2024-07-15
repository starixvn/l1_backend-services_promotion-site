import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSession, UserSessionSchema } from './schemas';
import { UserClientService } from './services/user-client.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: UserSession.name, schema: UserSessionSchema, collection: 'usersessions' }])],
    providers: [UserClientService],
    exports: [UserClientService],
})
export class UserClientServiceModule {}
