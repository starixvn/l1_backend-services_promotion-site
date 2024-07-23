import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import * as mongoose from 'mongoose';

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
