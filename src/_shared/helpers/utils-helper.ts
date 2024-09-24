export const isSiteNameIncluded = (includedSiteNames: string, siteName: string) => {
    return !includedSiteNames || includedSiteNames.replace(' ', '').toLowerCase().split(';').includes(siteName.toLowerCase());
};

export const roundUpToTwoDecimals = (number: number) => {
    return Math.ceil(number * 100) / 100;
};