import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import * as mongoose from 'mongoose';

export type ExchangeRatesDocument = ExchangeRates & mongoose.Document;

@Schema()
export class ExchangeRates {
    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    time: Date;

    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    exDate: Date;

    @ApiProperty({ type: Object })
    @Prop({ type: Object })
    code: object;
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRates);
