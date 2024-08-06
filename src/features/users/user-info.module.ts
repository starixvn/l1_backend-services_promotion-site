import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfos, UserInfosSchema } from './schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: UserInfos.name, schema: UserInfosSchema, collection: 'userinfos' }])],
})
export class UserInfoModule {}
