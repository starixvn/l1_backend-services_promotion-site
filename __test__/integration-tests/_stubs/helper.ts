import { AuthConfig } from '../../../src/config/auth-config';
import { OpenIdClientHelper } from '../../../src/helpers';

export const getBearerToken = async () => {
    const authConfigs = {
        uri: process.env.AUTH_URI,
        clientId: 'game-services',
        clientSecret: 'gameservices@20luminet&',
    } as AuthConfig;
    const openIdClient = new OpenIdClientHelper(authConfigs);

    return await openIdClient.getBearerToken();
};
