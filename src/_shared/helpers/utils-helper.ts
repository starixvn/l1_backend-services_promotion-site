export const isSiteNameIncluded = (includedSiteNames: string, siteName: string) => {
    return !includedSiteNames || includedSiteNames.replace(' ', '').split(',').includes(siteName);
};
