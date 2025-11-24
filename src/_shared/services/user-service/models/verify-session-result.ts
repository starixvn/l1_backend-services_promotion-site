export interface UserSession {
    ssoToken: string;

    sessionId: string;

    siteId: string;

    userId: string;

    username: string;

    owSeq?: string;

    memberId: string;

    ssoTime: Date;

    recheckInTime: Date;

    ip: string;

    browserUserAgent: string;

    language: string;

    currencyCode: string;

    currencyName: string;

    currencyGroupId: string;

    isTestCurrency: boolean;

    multiplier: number;

    partnerId: string;

    memberName: string;

    siteName: string;

    system: number;

    operatorId: string;

    playerId: string;

    playerName: string;

    disableJackpotGames: boolean;

    operatorToken: string;

    disableAward: boolean;

    id: string;

    xMode?: number;
}

export class VerifySessionResult {
    isAuthenticated: boolean;
    session: UserSession;

    constructor(isAuthenticated: boolean, session: UserSession) {
        this.isAuthenticated = isAuthenticated;
        this.session = session;
    }
}
