import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import * as mongoose from 'mongoose';

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

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    nickName: string;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    point: number;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    pointInBaseCurrency: number;

    @IsNumber()
    @ApiProperty()
    @Prop()
    checksumPoint: number;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    currency: string;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    currencyCode: string;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    updatedTime: Date;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    dataSourceTimeStamp: Date;

    @IsBoolean()
    @ApiProperty()
    @Prop({ required: false })
    isAwarded: boolean;

    @IsDate()
    @ApiProperty()
    @Prop({ required: false })
    awardedTime: Date;

    @IsNumber()
    @ApiProperty()
    @Prop()
    awardedAmount: number;

    @IsNumber()
    @ApiProperty()
    @Prop()
    awardedAmountInBaseCurrency: number;

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

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    multiplier: number;
}

export const PromotionLeaderBoardsSchema = SchemaFactory.createForClass(PromotionLeaderBoards);
