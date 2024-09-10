import { AuthConfig } from '../../../src/_shared/config/auth-config';
import { OpenIdClientHelper } from '../../../src/_shared/helpers';
import { VerifySessionResult } from '../../../src/_shared/services/user-service';
import { PromotionLeaderBoards } from '../../../src/features/promotion-leader-boards/schemas';

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

export const leaderBoards: PromotionLeaderBoards[] = [
    {
        awardedAmount: 0,
        awardedAmountInBaseCurrency: 0,
        checksumPoint: 100,
        promotionId: 1,
        operatorId: 'ONEworksVGCash',
        playerId: '1',
        siteName: 'lumi1',
        currencyGroupId: '61765beed2b6510001f18bd6',
        nickName: 'member1',
        point: 100000,
        pointInBaseCurrency: 100000,
        currency: 'INH',
        currencyCode: 'VND',
        updatedTime: new Date(),
        dataSourceTimeStamp: new Date(),
        awardedTime: new Date(),
        isAwarded: false,
        isTestCurrency: false,
        playerName: 'username_1',
        siteId: '4100300',
        multiplier: 1000,
    },
    {
        awardedAmount: 0,
        awardedAmountInBaseCurrency: 0,
        checksumPoint: 50000,
        promotionId: 1,
        operatorId: 'ONEworksVGCash',
        playerId: '2',
        siteName: 'lumi1',
        currencyGroupId: '61765beed2b6510001f18bd6',
        nickName: 'member2',
        point: 50,
        pointInBaseCurrency: 50000,
        currency: 'INH',
        currencyCode: 'VND',
        updatedTime: new Date(),
        dataSourceTimeStamp: new Date(),
        awardedTime: new Date(),
        isAwarded: false,
        isTestCurrency: false,
        playerName: 'username_2',
        siteId: '4100300',
        multiplier: 1000,
    },
    {
        awardedAmount: 0,
        awardedAmountInBaseCurrency: 0,
        checksumPoint: 50000,
        promotionId: 1,
        operatorId: 'ONEworksVGCash',
        playerId: '3',
        siteName: 'lumi1',
        currencyGroupId: '61765beed2b6510001f18bd6',
        nickName: 'member3',
        point: 50,
        pointInBaseCurrency: 50000,
        currency: 'INH',
        currencyCode: 'VND',
        updatedTime: new Date(),
        dataSourceTimeStamp: new Date(),
        awardedTime: new Date(),
        isAwarded: false,
        isTestCurrency: true,
        playerName: 'username_3',
        siteId: '4100300',
        multiplier: 1000,
    },

];

export const exchangeRates = {
    time: new Date(),
    exDate: new Date(),
    code: {
        VND: 1,
        USD: 23000,
    },
    exId: 111
};
