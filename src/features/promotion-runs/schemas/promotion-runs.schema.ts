import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber, IsDate, IsBoolean, isNumber, ValidateNested, IsArray } from 'class-validator';

export type PromotionRunsDocument = PromotionRuns & mongoose.Document;

export class PromotionBetPosition {
    latestEndGameLogId: string;
    latestEndGameLogTimeStamp: Date;
}

export class PromotionLeaderBoardPosition {
    latestPromotionBetId: string;
}

@Schema()
export class PromotionRuns {
    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    promotionId: number;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    latestRunTime: Date;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    promotionConfigs: string;
}

export const PromotionRunsSchema = SchemaFactory.createForClass(PromotionRuns);
