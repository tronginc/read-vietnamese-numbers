import IReadConfig from './IReadConfig';
import INumberData from './INumberData';

const DIGITS_PER_PART: number = 3;

const VN_DIGITS: string[] = [
    'không', 'một', 'hai', 'ba', 'bốn',
    'năm', 'sáu', 'bảy', 'tám', 'chín'
];

const VN_UNITS: string[][] = [
    [], ['nghìn'], ['triệu'], ['tỉ'],
    ['nghìn', 'tỉ'], ['triệu', 'tỉ'], ['tỉ', 'tỉ']
];

function readTwoDigits(b, c: number, hasHundred: boolean): string[] {
    let output: string[] = [];

    switch (b) {
        case 0: {
            if (hasHundred && c == 0)
                break;
            if (hasHundred)
                output.push('lẻ');
            output.push(VN_DIGITS[c]);
            break;
        }

        case 1: {
            output.push('mười');
            if (c == 5)
                output.push('lăm');
            else if (c != 0)
                output.push(VN_DIGITS[c]);
            break;
        }

        default: {
            output.push(VN_DIGITS[b], 'mươi');
            if (c == 1)
                output.push('mốt');
            else if (c == 4 && b != 4)
                output.push('tư');
            else if (c == 5)
                output.push('lăm');
            else if (c != 0)
                output.push(VN_DIGITS[c]);
            break;
        }
    }

    return output;
}

function readThreeDigits(a, b, c: number, readZeroHundred: boolean): string[] {
    let output: string[] = [];

    if (a == 0) {
        if (readZeroHundred)
            output.push('không', 'trăm');
    } else
        output.push(VN_DIGITS[a], 'trăm');

    output.push(...readTwoDigits(b, c, a != 0 || readZeroHundred));

    return output;
}

function parseNumberData(numberStr: string): INumberData {
    // Remove negative sign
    let isNegative: boolean = numberStr[0] == '-';
    let rawStr = (isNegative) ? numberStr.substr(1) : numberStr;

    // Remove leading 0s
    let pos: number = 0;
    while (rawStr[pos] == '0')
        pos++;
    rawStr = rawStr.substr(pos);

    // Count 0s to add
    let needZeroCount: number = 0;
    const modZeroCount: number = rawStr.length % DIGITS_PER_PART;
    if (modZeroCount != 0)
        needZeroCount = DIGITS_PER_PART - modZeroCount;

    // Add leading 0s to fit parts
    let fullStr = '';
    let i: number;
    for (i = 0; i < needZeroCount; i++)
        fullStr += '0';
    fullStr += rawStr;

    // Parse digits
    let digit: number;
    let digits: number[] = [];
    for (i = 0; i < fullStr.length; i++) {
        digit = parseInt(fullStr[i]);
        if (isNaN(digit))
            throw new Error('Số không hợp lệ');
        digits.push(digit);
    }

    // Building result
    let result: INumberData = { isNegative, digits };
    return result;
}

function readVietnameseNumber(numberData: INumberData, config: IReadConfig) {
    let output: string[] = [];

    let i: number, a: number, b: number, c: number;
    let isFirstPart: boolean, isSinglePart: boolean;
    let partCount: number = Math.round(numberData.digits.length / DIGITS_PER_PART);

    for (i = 0; i < partCount; i++) {
        a = numberData.digits[i * DIGITS_PER_PART];
        b = numberData.digits[i * DIGITS_PER_PART + 1];
        c = numberData.digits[i * DIGITS_PER_PART + 2];

        isFirstPart = i == 0;
        isSinglePart = partCount == 1;
        if (a != 0 || b != 0 || c != 0 || !config.skipEmptyPart || isSinglePart)
            output.push(
                ...readThreeDigits(a, b, c, !isFirstPart),
                ...VN_UNITS[partCount - i - 1]);
    }

    // Add sign and units
    if (numberData.isNegative)
        output.unshift('âm');
    output.push(config.unit);

    // Return joined result
    return output.join(config.separator);
}

export default {
    readTwoDigits, readThreeDigits, parseNumberData, readVietnameseNumber
}
