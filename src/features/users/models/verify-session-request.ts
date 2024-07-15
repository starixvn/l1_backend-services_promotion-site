import { IsString } from 'class-validator';

export class VerifySessionRequest {
    @IsString()
    readonly sessionId: string;

    @IsString()
    readonly username: string;

    @IsString()
    readonly browserUserAgent: string;
}
