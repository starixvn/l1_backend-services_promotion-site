import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserInfosDocument = UserInfos & Document;

@Schema()
export class UserInfos {
    @Prop()
    id: string;

    @Prop()
    name: string;
}

export const UserInfosSchema = SchemaFactory.createForClass(UserInfos);
