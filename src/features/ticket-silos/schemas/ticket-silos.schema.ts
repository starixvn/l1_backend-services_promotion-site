import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber, IsDate, IsBoolean, isNumber, ValidateNested, IsArray } from 'class-validator';

export type TicketSilosDocument = TicketSilos & mongoose.Document;

@Schema()
export class TicketSilos {
    @IsDate()
    @ApiProperty()
    @Prop({ required: true })
    roundTime: Date;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    gameId: number;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    playerId: string;

    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    operatorId: string;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    roundId: number;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    stake: number;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    payout: number;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    winloss: number;
}

export const TicketSilosSchema = SchemaFactory.createForClass(TicketSilos);
