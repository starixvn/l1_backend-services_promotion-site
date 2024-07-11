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

    @ApiProperty({ type: Object })
    @Prop({ type: Object })
    promotionBetPosition: object;

    @ApiProperty({ type: Object })
    @Prop({ type: Object })
    promotionLeaderBoardPosition: object;

    @IsBoolean()
    @ApiProperty()
    @Prop({ required: true })
    isJobRunning: boolean;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    latestRunTime: Date;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    time: Date;
}

export const PromotionRunsSchema = SchemaFactory.createForClass(PromotionRuns);
