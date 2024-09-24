import { roundUpToTwoDecimals, isSiteNameIncluded } from '../../../src/_shared/helpers';
describe('Utils Helper', () => {
    test('should round up 2.3456 to 2.35', () => {
        expect(roundUpToTwoDecimals(2.3456)).toBe(2.35);
    });

    test('should round up 2.341 to 2.35', () => {
        expect(roundUpToTwoDecimals(2.341)).toBe(2.35);
    });

    test('should round up 5.6789 to 5.68', () => {
        expect(roundUpToTwoDecimals(5.6789)).toBe(5.68);
    });

    test('should round 1.9999 to 2.00', () => {
        expect(roundUpToTwoDecimals(1.9999)).toBe(2.0);
    });

    test('should return the same value for 2.00', () => {
        expect(roundUpToTwoDecimals(2.0)).toBe(2.0);
    });

    test('should handle negative numbers like -2.3456 rounding up to -2.34', () => {
        expect(roundUpToTwoDecimals(-2.3456)).toBe(-2.34);
    });
});

describe('isSiteNameIncluded', () => {
    test('should return true when includedSiteNames is an empty string', () => {
        expect(isSiteNameIncluded('', 'lumigame.com')).toBe(true);
    });

    test('should return true when siteName is included in includedSiteNames', () => {
        expect(isSiteNameIncluded('lumigame.com;sabagame.com', 'lumigame.com')).toBe(true);
    });

    test('should return false when siteName is not included in includedSiteNames', () => {
        expect(isSiteNameIncluded('lumigame.com;sabagame.com', 'numbergame.com')).toBe(false);
    });

    test('should handle case insensitivity for siteName', () => {
        expect(isSiteNameIncluded('lumigame.com;sabagame.com', 'sabagame.com')).toBe(true);
    });

    test('should ignore spaces around site names', () => {
        expect(isSiteNameIncluded(' lumigame.com ; sabagame.com ', 'sabagame.com')).toBe(true);
    });

    test('should return false if includedSiteNames is a string but siteName is an empty string', () => {
        expect(isSiteNameIncluded('lumigame.com;sabagame.com', '')).toBe(false);
    });

    test('should return true when includedSiteNames contains only one siteName', () => {
        expect(isSiteNameIncluded('lumigame.com', 'lumigame.com')).toBe(true);
    });
});
