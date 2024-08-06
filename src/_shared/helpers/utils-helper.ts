export const isSiteNameIncluded = (includedSiteNames: string, siteName: string) => {
    return !includedSiteNames || includedSiteNames.replace(' ', '').toLowerCase().split(';').includes(siteName.toLowerCase());
};
