export default function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
