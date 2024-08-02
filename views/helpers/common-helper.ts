export function formatNumberWithComma(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

export function isAppType(system: number) {
    return window?.AppInitialState?.system === system;
}
