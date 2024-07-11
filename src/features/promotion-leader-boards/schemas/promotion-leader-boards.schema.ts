import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber, IsDate, IsBoolean, isNumber } from 'class-validator';

export type PromotionLeaderBoardsDocument = PromotionLeaderBoards & mongoose.Document;

@Schema()
export class PromotionLeaderBoards {
    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    promotionId: number;

    @IsString()
    @ApiProperty()
    @Prop({ type: Object, required: true })
    operatorId: string;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    playerId: number;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    siteName: string;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    currencyGroupId: string;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    nickName: string;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    point: number;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    latestPromotionBetId: string;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    updatedTime: Date;
}

export const PromotionLeaderBoardsSchema = SchemaFactory.createForClass(PromotionLeaderBoards);
