import { AuthConfig } from '../../../src/_shared/config/auth-config';
import { OpenIdClientHelper } from '../../../src/_shared/helpers';

export const getBearerToken = async () => {
    const authConfigs = {
        uri: process.env.AUTH_URI,
        clientId: 'game-services',
        clientSecret: 'gameservices@20luminet&',
    } as AuthConfig;
    const openIdClient = new OpenIdClientHelper(authConfigs);

    return await openIdClient.getBearerToken();
};
