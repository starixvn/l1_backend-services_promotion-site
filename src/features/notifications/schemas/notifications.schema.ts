import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber } from 'class-validator';
import * as mongoose from 'mongoose';

export type NotificationsDocument = Notifications & mongoose.Document;

export class Messages {
    'en-US': string;
    'vi-VN': string;
    'zh-CN': string;
    'zh-TW': string;
    'th-TH': string;
    'id-ID': string;
}

@Schema()
export class Notifications {
    @ApiProperty()
    @Prop({ type: String })
    promotionId: string;

    @ApiProperty({ type: Messages })
    @Prop({ type: Messages })
    messages: Messages;

    @ApiProperty({ type: Messages })
    @Prop({ type: Messages })
    title: Messages;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    time: Date;

    @IsNumber()
    @ApiProperty()
    @Prop({ type: Number })
    displayKind: number;

    @IsBoolean()
    @ApiProperty()
    @Prop({ type: Boolean })
    enabled: true;
}

export const NotificationsSchema = SchemaFactory.createForClass(Notifications);
