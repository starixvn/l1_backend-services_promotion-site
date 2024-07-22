import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber, IsDate, IsBoolean, isNumber, ValidateNested, IsArray } from 'class-validator';

export type PromotionBetsDocument = PromotionBets & mongoose.Document;

@Schema()
export class PromotionBets {
    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    operatorId: string;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    playerId: string;

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

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    validBetAmount: number;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    dataSourceId: string;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    dataSourceTimeStamp: Date;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    updatedTime: Date;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    currencyCode: string;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    currencyName: string;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    nickname: string;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    multiplier: number;

    @IsBoolean()
    @ApiProperty()
    @Prop({ required: true })
    isTestCurrency: boolean;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    playerName: string;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    siteId: string;
}

export const PromotionBetsSchema = SchemaFactory.createForClass(PromotionBets);
