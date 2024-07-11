import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import * as mongoose from 'mongoose';

export type PromotionConfigsDocument = PromotionConfigs & mongoose.Document;

export class CurrencyGroup {
    currencyGroupId: string;
    slotGameMinBet: number;
    otherGameMinBet: number;
    enabled: boolean;
}

export class Operator {
    operatorId: string;
    excludedSiteNames: string;
    currencyGroups: CurrencyGroup[];
}

export class WinningPrize {
    name: string;
    value: number;
    quantity: number;
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

    @ApiProperty({ type: [Object] })
    @Prop({ type: [Object] })
    winningPrizes: object[];

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    time: Date;
}

export const PromotionConfigsSchema = SchemaFactory.createForClass(PromotionConfigs);
