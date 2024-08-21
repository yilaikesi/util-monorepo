/**
 * @description 前端数据脱敏
 * @static 策略: 左固定 length，中间补齐，右边固定length
 * @param {object} options - 选项对象
 * @param {number} options.fixlength - 左右固定长度
 * @param {number} options.leftlength - 左边固定长度
 * @param {number} options.rightLength - 右边固定长度
 * @param {string} data - 要脱敏的数据
 * @param {string} fillChar - 中间补齐的字符，默认为'*'
 * @returns {string} 脱敏后的数据
 */
export const dataMasking = ({ fixlength, leftlength, rightLength, data, fillChar = '*' }) => {
   
    if (!data || typeof data !== 'string') {
        throw new Error('请提供有效的字符串数据');
    }
    if (data.length <= leftlength + rightLength) {
        return data; // 如果数据长度小于等于左右固定长度之和，则无需脱敏
    }
    const leftPart = data.slice(0, leftlength);
    const rightPart = data.slice(-rightLength);
    if(!fixlength){
        const maskedLength = data.length - leftlength - rightLength;
        const maskedPart = fillChar.repeat(maskedLength);
        return leftPart + maskedPart + rightPart;
    }
    const maskedLength = fixlength - leftlength - rightLength;
    const maskedPart = fillChar.repeat(maskedLength);
    return leftPart + maskedPart + rightPart;
};
let data = '430426200007139534';
console.log(dataMasking({ fixlength: 10, leftlength: 2, rightLength: 2, data })); // '12****78'