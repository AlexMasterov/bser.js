'use strict';
/* istanbul ignore file */

const hasBigInt = global.BigInt !== void 0;

function getEncoderInt64LE() {
  return hasBigInt
    ? require('./bigint64').encodeBigIntLE
    : encodeIntOverflow;
}

function getDecoderInt64BE() {
  return hasBigInt
    ? require('./bigint64').decodeBigInt64BE
    : require('./int64').decodeInt64BE;
}

function getDecoderInt64LE() {
  return hasBigInt
    ? require('./bigint64').decodeBigInt64LE
    : require('./int64').decodeInt64LE;
}

function encodeIntOverflow(num) {
  return num > 0x1fffffffffffff
    ? '\xcf\x00\x20\x00\x00\x00\x00\x00\x00' // Infinity
    : '\xd3\xff\xdf\xff\xff\xff\xff\xff\xff'; // -Infinity
}

function getEncoderInt64BE() {
  return hasBigInt
    ? require('./bigint64').encodeBigIntBE
    : encodeIntOverflow;
}

module.exports = class Methods {
  static get getDecoderInt64BE() { return getDecoderInt64BE; }
  static get getDecoderInt64LE() { return getDecoderInt64LE; }
  static get getEncoderInt64BE() { return getEncoderInt64BE; }
  static get getEncoderInt64LE() { return getEncoderInt64LE; }
};
