import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserSessionDocument = UserSession & Document;

@Schema()
export class UserSession {
    @Prop({ unique: true })
    sessionId: string;

    @Prop()
    siteId: string;

    @Prop()
    userId: string;

    @Prop()
    currencyCode: string;

    @Prop()
    currencyName: string;

    @Prop()
    currencyGroupId: string;

    @Prop()
    partnerId: string;

    @Prop()
    siteName: string;

    @Prop()
    operatorId: string;

    @Prop()
    playerId: string;

    @Prop()
    playerName: string;

    @Prop()
    isTestCurrency: boolean;

    @Prop()
    operatorToken: string;

    @Prop()
    username: string;

    @Prop()
    browserUserAgent: string;

    @Prop({ required: true })
    recheckInTime: Date;

    @Prop()
    disableAward: boolean;

    @Prop({ required: true })
    ssoTime: Date;

    @Prop()
    multiplier: number;

    @Prop()
    id: string;

    @Prop()
    xMode?: number;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
