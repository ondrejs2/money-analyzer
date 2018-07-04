import isNumeric from './isNumeric';

export const FORMAT_TYPE = Object.freeze({
    SEPARATE_THOUSANDS: 'separateThousands',
    TWO_DIGITS: 'twoDigits'
});

export default function formatNumber(number, formatType) {
    if (!isNumeric(number)) {
        return number;
    }

    if (typeof number !== 'number') {
        number = parseFloat(number);
    }

    switch (formatType) {
        case FORMAT_TYPE.SEPARATE_THOUSANDS:
            return number.toLocaleString(undefined, {
                useGrouping: true
            });
        case FORMAT_TYPE.TWO_DIGITS:
            return number.toLocaleString(undefined, {
                minimumIntegerDigits: 2
            });
        default:
            return number
    }
}
