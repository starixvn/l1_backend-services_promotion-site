export function formatNumberWithComma(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

export function formatRoundUpNumberWithComma(number, fractionDigits = 0) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(Math.ceil(number * 100) / 100);
}


export function isAppType(system: number) {
    return window?.AppInitialState?.system === system;
}

export const formatDateTimePadStart = (value: number) => {
    return value.toString().padStart(2, '0')
}