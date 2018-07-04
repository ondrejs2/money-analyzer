export default function formatNumber(number) {
    const stringNumber = number.toString();

    return stringNumber.length < 2 ? `0${stringNumber}` : stringNumber;
}
