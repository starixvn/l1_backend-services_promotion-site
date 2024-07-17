import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber, IsDate, IsBoolean, isNumber, ValidateNested, IsArray } from 'class-validator';

export const LOG_DB = 'log';
export const END_GAMES_COLLECTION = 'end_games';

export type EndGamesDocument = EndGames & mongoose.Document;

export class Call {
    playerId: string;
    siteId: string;
    gameRoundId: number;
    gameTypeId: number;
    totalAmount: string;
    totalWin: string;
}

@Schema()
export class EndGames {
    @IsString()
    @ApiProperty()
    @Prop()
    operatorId: string;

    @IsString()
    @ApiProperty()
    @Prop()
    logTimeStamp: string;

    @ApiProperty({ type: Call })
    @Prop({ type: Call })
    call: Call;

    @IsNumber()
    @ApiProperty()
    @Prop()
    system: number;
}

export const EndGamesSchema = SchemaFactory.createForClass(EndGames);
