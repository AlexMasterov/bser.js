'use strict';

const CHR = require('ascii-chr');

const u64 = new BigUint64Array(1);
const i64 = new BigInt64Array(1);
const u8u64 = new Uint8Array(u64.buffer);
const i8i64 = new Int8Array(i64.buffer);
const u32u64 = new Uint32Array(u64.buffer);
const i32i64 = new Int32Array(i64.buffer);

function decodeBigInt64BE() {
  i32i64[1] = this.buffer[this.offset] << 24
    | this.buffer[this.offset + 1] << 16
    | this.buffer[this.offset + 2] << 8
    | this.buffer[this.offset + 3];

  i32i64[0] = this.buffer[this.offset + 4] << 24
    | this.buffer[this.offset + 5] << 16
    | this.buffer[this.offset + 6] << 8
    | this.buffer[this.offset + 7];

  this.offset += 8;

  return i64[0];
}

function decodeBigInt64LE() {
  i32i64[0] = this.buffer[this.offset]
    | this.buffer[this.offset + 1] << 8
    | this.buffer[this.offset + 2] << 16
    | this.buffer[this.offset + 3] << 24;

  i32i64[1] = this.buffer[this.offset + 4]
    | this.buffer[this.offset + 5] << 8
    | this.buffer[this.offset + 6] << 16
    | this.buffer[this.offset + 7] << 24;

  this.offset += 8;

  return i64[0];
}

function encodeBigIntBE(bignum) {
  if (bignum < 0) {
    i64[0] = bignum;
    return '\x06'
      + CHR[i8i64[7] & 0xff]
      + CHR[i8i64[6] & 0xff]
      + CHR[i8i64[5] & 0xff]
      + CHR[i8i64[4] & 0xff]
      + CHR[i8i64[3] & 0xff]
      + CHR[i8i64[2] & 0xff]
      + CHR[i8i64[1] & 0xff]
      + CHR[i8i64[0] & 0xff];
  }

  u64[0] = bignum;
  return '\x06'
    + CHR[u8u64[7]]
    + CHR[u8u64[6]]
    + CHR[u8u64[5]]
    + CHR[u8u64[4]]
    + CHR[u8u64[3]]
    + CHR[u8u64[2]]
    + CHR[u8u64[1]]
    + CHR[u8u64[0]];
}

function encodeBigIntLE(bignum) {
  if (bignum < 0) {
    i64[0] = bignum;
    return '\x06'
      + CHR[i8i64[0] & 0xff]
      + CHR[i8i64[1] & 0xff]
      + CHR[i8i64[2] & 0xff]
      + CHR[i8i64[3] & 0xff]
      + CHR[i8i64[4] & 0xff]
      + CHR[i8i64[5] & 0xff]
      + CHR[i8i64[6] & 0xff]
      + CHR[i8i64[7] & 0xff];
  }

  u64[0] = bignum;
  return '\x06'
    + CHR[u8u64[0]]
    + CHR[u8u64[1]]
    + CHR[u8u64[2]]
    + CHR[u8u64[3]]
    + CHR[u8u64[4]]
    + CHR[u8u64[5]]
    + CHR[u8u64[6]]
    + CHR[u8u64[7]];
}

module.exports = class BigInt64 {
  static get decodeBigInt64BE() { return decodeBigInt64BE; }
  static get decodeBigInt64LE() { return decodeBigInt64LE; }
  static get encodeBigIntBE() { return encodeBigIntBE; }
  static get encodeBigIntLE() { return encodeBigIntLE; }
};
