'use strict';

const { utf8toBin } = require('utf8-bin');
const { CHR, f64, u64, i64 } = require('./binary');

const isArray = Array.isArray;
const ObjectKeys = Object.keys;
const alloc = Buffer.allocUnsafe;
const u8f64 = new Uint8Array(f64.buffer);
const u8u64 = new Uint8Array(u64.buffer);
const i8i64 = new Int8Array(i64.buffer);

const Bool = 'boolean';
const Num = 'number';
const BigNum = 'bigint';
const Str = 'string';
const Obj = 'object';

const ALLOC_BYTES = 2048;

class EncoderLE {
  constructor({ bufferMinLen=15 } = {}) {
    this.alloc = 0;
    this.buffer = null;
    this.bufferMinLen = bufferMinLen >>> 0;
  }

  encode(value) {
    const binary = this.handle(value);
    return '\x00\x01'
      + this.encodeInt(binary.length)
      + binary;
  }

  handle(value) {
    switch (typeof value) {
      case Str:
        return this.encodeStr(value);
      case Num:
        return (value % 1 === 0) ? this.encodeInt(value) : this.encodeReal(value);
      case Bool:
        return value ? '\x08' : '\x09';
      case Obj:
        if (value === null) return '\x0a';
        if (isArray(value)) return this.encodeArray(value);
        return this.encodeObject(value);
      case BigNum:
        return (value > 0xffffffff || value < -0x80000000)
          ? this.encodeBigInt(value)
          : this.encodeInt(Number(value));
    }
  }

  encodeNull() {
    return '\x0a';
  }

  encodeBool(bool) {
    return bool ? '\x08' : '\x09';
  }

  encodeReal(num) {
    f64[0] = num;
    return '\x07'
      + CHR(u8f64[0])
      + CHR(u8f64[1])
      + CHR(u8f64[2])
      + CHR(u8f64[3])
      + CHR(u8f64[4])
      + CHR(u8f64[5])
      + CHR(u8f64[6])
      + CHR(u8f64[7]);
  }

  encodeInt(num) {
    if (num < 0) {
      // int_t 8
      if (num > -0x80) {
        return '\x03'
          + CHR(num & 0xff);
      }
      // int_t 16
      if (num > -0x8000) {
        return '\x04'
          + CHR(num & 0xff)
          + CHR(num >> 8 & 0xff);
      }
      // int_t 32
      if (num > -0x80000000) {
        return '\x05'
          + CHR(num & 0xff)
          + CHR(num >> 8 & 0xff)
          + CHR(num >> 16 & 0xff)
          + CHR(num >> 24 & 0xff);
      }
      // int_t 64
      if (num > -0x20000000000000) {
        return '\x06'
          + encodeInt64(
            (num / 0x100000000 >> 0) - 1,
            num >>> 0
          );
      }
      // -Infinity
      return '\x06\xff\xff\xff\xff\xff\xff\xdf\xff';
    }
    // (u)int_t 8
    if (num < 0x80) {
      return '\x03'
        + CHR(num);
    }
    // (u)int_t 16
    if (num < 0x8000) {
      return '\x04'
        + CHR(num & 0xff)
        + CHR(num >> 8 & 0xff);
    }
    // (u)int_t 32
    if (num < 0x80000000) {
      return '\x05'
        + CHR(num & 0xff)
        + CHR(num >> 8 & 0xff)
        + CHR(num >> 16 & 0xff)
        + CHR(num >> 24 & 0xff);
    }
    // (u)int_t 64
    if (num < 0x20000000000000) {
      return '\x06'
        + encodeInt64(
          num >>> 11 | 1,
          num
        );
    }
    // Infinity
    return '\x06\x00\x00\x00\x00\x00\x00\x20\x00';
  }

  encodeBigInt(bignum) {
    if (bignum < 0) {
      i64[0] = bignum;
      return '\x06'
        + CHR(i8i64[0] & 0xff)
        + CHR(i8i64[1] & 0xff)
        + CHR(i8i64[2] & 0xff)
        + CHR(i8i64[3] & 0xff)
        + CHR(i8i64[4] & 0xff)
        + CHR(i8i64[5] & 0xff)
        + CHR(i8i64[6] & 0xff)
        + CHR(i8i64[7] & 0xff);
    }

    u64[0] = bignum;
    return '\x06'
      + CHR(u8u64[0])
      + CHR(u8u64[1])
      + CHR(u8u64[2])
      + CHR(u8u64[3])
      + CHR(u8u64[4])
      + CHR(u8u64[5])
      + CHR(u8u64[6])
      + CHR(u8u64[7]);
  }

  encodeStr(str) {
    let len = str.length, bin = '\x02\x03\x00';
    if (len === 0) return bin;

    if (len < this.bufferMinLen) {
      bin = utf8toBin(str);
      len = bin.length;
    } else {
      if (len > this.alloc) {
        this.alloc = ALLOC_BYTES * (len >>> 10 | 2);
        this.buffer = alloc(this.alloc);
      }
      len = this.buffer.latin1Write(str, 0);
      bin = this.buffer.latin1Slice(0, len);
    }

    // int_t 8
    if (len < 0x80) {
      return '\x02\x03'
        + CHR(len)
        + bin;
    }
    // int_t 16
    if (len < 0x8000) {
      return '\x02\x04'
        + CHR(len & 0xff)
        + CHR(len >> 8 & 0xff)
        + bin;
    }
    // int_t 32
    if (len < 0x80000000) {
      return '\x02\x05'
        + CHR(len & 0xff)
        + CHR(len >> 8 & 0xff)
        + CHR(len >> 16 & 0xff)
        + CHR(len >> 24 & 0xff)
        + bin;
    }
    // int_t 64
    return '\x02'
        + encodeInt64(len)
        + bin;
  }

  encodeArray(arr) {
    const len = arr.length;
    if (len === 0) return '\x00\x03\x00';

    let bin;
    if (len < 0x80) { // int_t 8
      bin = '\x00\x03'
        + CHR(len);
    } else if (len < 0x8000) { // int_t 16
      bin = '\x00\x04'
        + CHR(len & 0xff)
        + CHR(len >> 8 & 0xff);
    } else { // int_t 32
      bin = '\x00\x05'
        + CHR(len & 0xff)
        + CHR(len >> 8 & 0xff)
        + CHR(len >> 16 & 0xff)
        + CHR(len >> 24 & 0xff);
    }

    for (let i = 0; i < len; i++) {
      bin += this.handle(arr[i]);
    }

    return bin;
  }

  encodeObject(obj) {
    const keys = ObjectKeys(obj);
    const len = keys.length;
    if (len === 0) return '\x01\x03\x00';

    let bin;
    if (len < 0x80) { // int_t 8
      bin = '\x01\x03'
        + CHR(len);
    } else if (len < 0x8000) { // int_t 16
      bin = '\x01\x04'
        + CHR(len & 0xff)
        + CHR(len >> 8);
    } else {
      bin = '\x01\x05'
        + CHR(len & 0xff)
        + CHR(len >> 8 & 0xff)
        + CHR(len >> 16 & 0xf)
        + CHR(len >> 24 & 0xf);
    }

    for (let key, i = 0; i < len; i++) {
      key = keys[i];
      bin += this.encodeStr(key);
      bin += this.handle(obj[key]);
    }

    return bin;
  }
}

function encodeInt64(hi, lo) {
  return CHR(lo & 0xff)
    + CHR(lo >> 8 & 0xff)
    + CHR(lo >> 16 & 0xff)
    + CHR(lo >> 24 & 0xff)
    + CHR(hi & 0xff)
    + CHR(hi >> 8 & 0xff)
    + CHR(hi >> 16 & 0xff)
    + CHR(hi >> 24 & 0xff);
}

module.exports = EncoderLE;
