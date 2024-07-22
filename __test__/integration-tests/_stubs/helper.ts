import { AuthConfig } from '../../../src/_shared/config/auth-config';
import { OpenIdClientHelper } from '../../../src/_shared/helpers';
import { VerifySessionResult } from '../../../src/_shared/services/user-service';

export const getBearerToken = async () => {
    const authConfigs = {
        uri: process.env.AUTH_URI,
        clientId: 'game-services',
        clientSecret: 'gameservices@20luminet&',
    } as AuthConfig;
    const openIdClient = new OpenIdClientHelper(authConfigs);

    return await openIdClient.getBearerToken();
};

export const validSession: VerifySessionResult = {
    isAuthenticated: true,
    session: {
        browserUserAgent: 'chrome',
        username: 'testUser',
        sessionId: 'xch5pum5k1K2Hjozkmgt404MnJjgAyg9_ONEworksVGCash_7364518',
        currencyGroupId: '61765beed2b6510001f18bd6',
        disableAward: false,
        isTestCurrency: false,
        language: 'en-US',
        siteName: 'lumi1',
        multiplier: 1000,
        operatorId: 'ONEworksVGCash',
        playerId: '1',
        currencyCode: 'VND',
        currencyName: 'INH',
        disableJackpotGames: false,
        id: '100',
        ip: '1.0.0.0',
        memberId: '100',
        memberName: 'test',
        operatorToken: 'ONEworksVGCashToken',
        partnerId: 'ONEworksVGCash',
        playerName: 'username_100',
        recheckInTime: new Date(),
        siteId: '4100300',
        ssoTime: new Date(),
        ssoToken: '09c300c2-e2ac-40f2-8e4b-1a215cdde0fb',
        system: 2,
        userId: '63f41cc062caa79175d4bbdb',
    },
};
