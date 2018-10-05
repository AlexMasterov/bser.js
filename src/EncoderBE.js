'use strict';

const CHR = require('ascii-chr');
const { FastBuffer, utf8toBin } = require('./optimizers');

const isArray = Array.isArray;
const ObjectKeys = Object.keys;
const float64Array = new Float64Array(1);
const Uint8Float64Array = new Uint8Array(float64Array.buffer);

const ALLOC_BYTES = 2048;

function encodeUint64(num) {
  const hi = num / 0x100000000 >> 0;
  const lo = num >>> 0;
  return '\x06'
    + CHR[hi >> 24 & 0xff]
    + CHR[hi >> 16 & 0xff]
    + CHR[hi >> 8 & 0xff]
    + CHR[hi & 0xff]
    + CHR[lo >> 24 & 0xff]
    + CHR[lo >> 16 & 0xff]
    + CHR[lo >> 8 & 0xff]
    + CHR[lo & 0xff];
}

function encodeInt64(num) {
  const hi = (num / 0x100000000 >> 0) - 1;
  const lo = num >>> 0;
  return '\x06'
    + CHR[hi >> 24 & 0xff]
    + CHR[hi >> 16 & 0xff]
    + CHR[hi >> 8 & 0xff]
    + CHR[hi & 0xff]
    + CHR[lo >> 24 & 0xff]
    + CHR[lo >> 16 & 0xff]
    + CHR[lo >> 8 & 0xff]
    + CHR[lo & 0xff];
}

class EncoderBE {
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
      case 'number':
        return value % 1 === 0 ? this.encodeInt(value) : this.encodeFloat64(value);
      case 'string':
        return this.encodeStr(value);
      case 'boolean':
        return value ? '\x08' : '\x09';
      case 'object':
        if (value === null) return '\x0a';
        if (isArray(value)) return this.encodeArray(value);
        return this.encodeObject(value);
    }
  }

  encodeNil() {
    return '\x0a';
  }

  encodeFloat64(num) {
    float64Array[0] = num;

    return '\x07'
      + CHR[Uint8Float64Array[7]]
      + CHR[Uint8Float64Array[6]]
      + CHR[Uint8Float64Array[5]]
      + CHR[Uint8Float64Array[4]]
      + CHR[Uint8Float64Array[3]]
      + CHR[Uint8Float64Array[2]]
      + CHR[Uint8Float64Array[1]]
      + CHR[Uint8Float64Array[0]];
  }

  encodeInt(num) {
    if (num < 0) {
      // int_t 8
      if (num > -0x80) {
        return '\x03'
          + CHR[num & 0xff];
      }
      // int_t 16
      if (num > -0x8000) {
        return '\x04'
          + CHR[num >> 8 & 0xff]
          + CHR[num & 0xff];
      }
      // int_t 32
      if (num > -0x80000000) {
        return '\x05'
          + CHR[num >> 24 & 0xff]
          + CHR[num >> 16 & 0xff]
          + CHR[num >> 8 & 0xff]
          + CHR[num & 0xff];
      }
      // int_t 64
      if (num > -0x20000000000000) {
        return encodeInt64(num);
      }
      // -Infinity
      return '\x06\xff\xf0\x00\x00\x00\x00\x00\x00';
    }
    // (u)int_t 8
    if (num < 0x80) {
      return '\x03'
        + CHR[num];
    }
    // (u)int_t 16
    if (num < 0x8000) {
      return '\x04'
        + CHR[num >> 8 & 0xff]
        + CHR[num & 0xff];
    }
    // (u)int_t 32
    if (num < 0x80000000) {
      return '\x05'
        + CHR[num >> 24 & 0xff]
        + CHR[num >> 16 & 0xff]
        + CHR[num >> 8 & 0xff]
        + CHR[num & 0xff];
    }
    // (u)int_t 64
    if (num < 0x20000000000000) {
      return encodeUint64(num);
    }
    // Infinity
    return '\x06\x7f\xf0\x00\x00\x00\x00\x00\x00';
  }

  encodeStr(str) {
    let len = str.length, bin = '\x02\x03\x00';
    if (len === 0) return bin;

    if (len < this.bufferMinLen) {
      bin = utf8toBin(str);
      len = bin.length;
    } else {
      if (len > this.alloc) {
        this.alloc = ALLOC_BYTES * ((len | ALLOC_BYTES) / 896 >> 0);
        this.buffer = new FastBuffer(this.alloc);
      }
      len = this.buffer.latin1Write(str, 0);
      bin = this.buffer.latin1Slice(0, len);
    }

    // int_t 8
    if (len < 0x80) {
      return '\x02\x03'
        + CHR[len]
        + bin;
    }
    // int_t 16
    if (len < 0x8000) {
      return '\x02\x04'
        + CHR[len >> 8 & 0xff]
        + CHR[len & 0xff]
        + bin;
    }
    // int_t 32
    if (len < 0x80000000) {
      return '\x02\x05'
        + CHR[len >> 24 & 0xff]
        + CHR[len >> 16 & 0xff]
        + CHR[len >> 8 & 0xff]
        + CHR[len & 0xff]
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

    let data;
    if (len < 0x80) { // int_t 8
      data = '\x00\x03'
        + CHR[len];
    } else if (len < 0x8000) { // int_t 16
      data = '\x00\x04'
        + CHR[len >> 8 & 0xff]
        + CHR[len & 0xff];
    } else { // int_t 32
      data = '\x00\x05'
        + CHR[len >> 24 & 0xff]
        + CHR[len >> 16 & 0xff]
        + CHR[len >> 8 & 0xff]
        + CHR[len & 0xff];
    }

    for (let i = 0; i < len; i++) {
      data += this.handle(arr[i]);
    }

    return data;
  }

  encodeObject(obj) {
    const keys = ObjectKeys(obj);
    const len = keys.length;
    if (len === 0) return '\x01\x03\x00';

    let data;
    if (len < 0x80) { // int_t 8
      data = '\x01\x03'
        + CHR[len];
    } else if (len < 0x8000) { // int_t 16
      data = '\x01\x04'
        + CHR[len >> 8]
        + CHR[len & 0xff];
    } else {
      data = '\x01\x05'
        + CHR[len >> 24 & 0xff]
        + CHR[len >> 16 & 0xff]
        + CHR[len >> 8 & 0xff]
        + CHR[len & 0xff];
    }

    for (let key, i = 0; i < len; i++) {
      key = keys[i];
      data += this.encodeStr(key);
      data += this.handle(obj[key]);
    }

    return data;
  }
}

module.exports = EncoderBE;
