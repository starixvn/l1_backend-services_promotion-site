export function formatNumberWithComma(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

export function isAppType(system: number) {
    return window?.AppInitialState?.system === system;
}

export const formatDateTimePadStart = (value: number) => {
    return value.toString().padStart(2, '0')
}