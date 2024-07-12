import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber, IsDate, IsBoolean, isNumber, ValidateNested, IsArray } from 'class-validator';

export type GameConfigsDocument = GameConfigs & mongoose.Document;

export const SLOT_GAME_TYPES = [2, 3];

@Schema()
export class GameConfigs {
    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    gameId: number;

    @IsNumber()
    @ApiProperty()
    @Prop({ required: true })
    type: number;
}

export const GameConfigsSchema = SchemaFactory.createForClass(GameConfigs);
