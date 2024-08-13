export default () => ({
    database: {
        uri: process.env.DATABASE_URI,
        dbName: process.env.DATABASE_NAME,
        //options: {
        //  dbName: process.env.DATABASE_NAME,
        //useNewUrlParser: true,
        //useUnifiedTopology: true,
        //auto_reconnect: true,
        //},
    },
    auth: {
        uri: process.env.AUTH_URI,
        clientId: 'game-server',
        clientSecret: 'gameserver@20luminet&',
        audiences: ['api', 'admin-api', 'game-services'],
        validIssuers: process.env.VALID_ISSUERS.split(','),
    },
    sentry: {
        dsn: process.env.SENTRY_DSN,
        release: process.env.SENTRY_RELEASE,
        env: process.env.ENV,
        logIdentifier: 'promotion-site',
    },
    systemName: process.env.SYSTEM_TYPE,
});
