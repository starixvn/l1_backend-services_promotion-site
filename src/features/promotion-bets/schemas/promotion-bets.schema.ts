import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber, IsDate, IsBoolean, isNumber, ValidateNested, IsArray } from 'class-validator';

export type PromotionBetsDocument = PromotionBets & mongoose.Document;

@Schema()
export class PromotionBets {
    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    promotionId: number;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
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

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    gameId: number;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    roundId: number;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    totalAmount: number;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    totalWin: number;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    endGameLogId: string;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    endGameLogTimeStamp: Date;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    updatedTime: Date;
}

export const PromotionBetsSchema = SchemaFactory.createForClass(PromotionBets);
