import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNumber, IsDate, IsBoolean, isNumber, ValidateNested, IsArray } from 'class-validator';

export type TempLogEndGamesDocument = TempLogEndGames & mongoose.Document;

@Schema()
export class TempLogEndGames {
    @IsString()
    @ApiProperty()
    @Prop({ required: true })
    operatorId: string;

    @IsString()
    @ApiProperty()
    @Prop()
    playerId: string;

    @IsDate()
    @ApiProperty()
    @Prop()
    logTimeStamp: Date;

    @IsString()
    @ApiProperty()
    @Prop()
    logId: string;

    @IsString()
    @ApiProperty()
    @Prop()
    siteId: string;

    @IsNumber()
    @ApiProperty()
    @Prop()
    gameRoundId: number;

    @IsNumber()
    @ApiProperty()
    @Prop()
    gameTypeId: number;

    @IsNumber()
    @ApiProperty()
    @Prop()
    totalAmount: number;

    @IsNumber()
    @ApiProperty()
    @Prop()
    totalWin: number;

    @IsNumber()
    @ApiProperty()
    @Prop()
    validBetAmount: number;

    @IsNumber()
    @ApiProperty()
    @Prop()
    system: number;
}

export const TempLogEndGamesSchema = SchemaFactory.createForClass(TempLogEndGames);
