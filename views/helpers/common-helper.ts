export function formatNumberWithComma(number, fractionDigits = 0) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(number);
}

export function isAppType(system: number) {
    return window?.AppInitialState?.system === system;
}

export const formatDateTimePadStart = (value: number) => {
    return value.toString().padStart(2, '0')
}