import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import * as mongoose from 'mongoose';

export type PromotionConfigsDocument = PromotionConfigs & mongoose.Document;

export const PROMOTION_STATUSES = {
    new: 'new',
    running: 'running',
    completed: 'completed',
    paid: 'paid',
};

export class CurrencyGroup {
    currencyGroupId: string;
    slotGameMinBet: number;
    otherGameMinBet: number;
    enabled: boolean;
}

export class Operator {
    operatorId: string;
    includedSiteNames: string;
    currencyGroups: CurrencyGroup[];
}

export class WinningPrize {
    value: number;
    ranking: string;
}

@Schema()
export class PromotionConfigs {
    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    promotionId: number;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    startDateTime: Date;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    endDateTime: Date;

    @ApiProperty({ isArray: true, type: Operator })
    @Prop({ isArray: true, type: Operator })
    operators: Operator[];

    @ApiProperty({ isArray: true, type: WinningPrize })
    @Prop({ isArray: true, type: WinningPrize })
    winningPrizes: WinningPrize[];

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    updatedTime: Date;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    status: string;
}

export const PromotionConfigsSchema = SchemaFactory.createForClass(PromotionConfigs);
