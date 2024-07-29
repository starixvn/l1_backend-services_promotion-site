
export function formatNumberWithComma(number) {
    return new Intl.NumberFormat('en-US').format(number);
}