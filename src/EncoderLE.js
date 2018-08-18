'use strict';

const { utf8toBin, CHR } = require('./utf8');

const isArray = Array.isArray;
const ObjectKeys = Object.keys;
const FastBuffer = Buffer[Symbol.species];
const float64Array = new Float64Array(1);
const Uint8Float64Array = new Uint8Array(float64Array.buffer);
const Int64Array = new BigInt64Array(1);
const Int8Int64Array = new Int8Array(Int64Array.buffer);

const ALLOC_BYTES = 2048;

function encodeInt64(num) {
  const hi = (num / 0x100000000 >> 0) - 1;
  const lo = num >>> 0;
  return '\x06'
    + CHR[lo & 0xff]
    + CHR[lo >> 8 & 0xff]
    + CHR[lo >> 16 & 0xff]
    + CHR[lo >> 24 & 0xff]
    + CHR[hi & 0xff]
    + CHR[hi >> 8 & 0xff]
    + CHR[hi >> 16 & 0xff]
    + CHR[hi >> 24 & 0xff];
}

function encodeBigInt(num) {
  Int64Array[0] = num;
  return '\x06'
    + CHR[Int8Int64Array[0] & 0xff]
    + CHR[Int8Int64Array[1] & 0xff]
    + CHR[Int8Int64Array[2] & 0xff]
    + CHR[Int8Int64Array[3] & 0xff]
    + CHR[Int8Int64Array[4] & 0xff]
    + CHR[Int8Int64Array[5] & 0xff]
    + CHR[Int8Int64Array[6] & 0xff]
    + CHR[Int8Int64Array[7] & 0xff];
}

class EncoderLE {
  constructor() {
    this.alloc = 0;
    this.buffer = null;
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
      case 'bigint':
        return encodeBigInt(value);
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

  encodeFloat64(num) {
    float64Array[0] = num;

    return '\x07'
      + CHR[Uint8Float64Array[0]]
      + CHR[Uint8Float64Array[1]]
      + CHR[Uint8Float64Array[2]]
      + CHR[Uint8Float64Array[3]]
      + CHR[Uint8Float64Array[4]]
      + CHR[Uint8Float64Array[5]]
      + CHR[Uint8Float64Array[6]]
      + CHR[Uint8Float64Array[7]];
  }

  encodeInt(num) {
    // int 8
    if (num >= -0x80 && num <= 0x7f) {
      return '\x03'
        + CHR[num & 0xff];
    }
    // int 16
    if (num >= -0x8000 && num <= 0x7fff) {
      return '\x04'
        + CHR[num & 0xff]
        + CHR[num >> 8 & 0xff];
    }
    // int 32
    if (num >= -0x80000000 && num <= 0x7fffffff) {
      return '\x05'
        + CHR[num & 0xff]
        + CHR[num >> 8 & 0xff]
        + CHR[num >> 16 & 0xff]
        + CHR[num >> 24 & 0xff];
    }
    // int 64 (safe int)
    return encodeInt64(num);
  }

  encodeStr(str) {
    let len = str.length, bin = '\x02\x03\x00';
    if (len === 0) return bin;

    if (len < 10) {
      bin = utf8toBin(str);
      len = bin.length;
    } else {
      if (len > this.alloc) {
        this.alloc = ALLOC_BYTES * ((len | ALLOC_BYTES) / 896 >> 0);
        this.buffer = new FastBuffer(this.alloc);
      }
      len = this.buffer.utf8Write(str, 0);
      bin = this.buffer.latin1Slice(0, len);
    }

    // int 8
    if (len <= 0xff) {
      return '\x02\x03'
        + CHR[len]
        + bin;
    }
    // int 16
    if (num <= 0xffff) {
      return '\x02\x04'
        + CHR[num >> 8]
        + CHR[num & 0xff]
        + bin;
    }
    // int 32
    if (num <= 0xffffffff) {
      return '\x02\x05'
        + CHR[num & 0xff]
        + CHR[num >> 8 & 0xff]
        + CHR[num >> 16 & 0xff]
        + CHR[num >> 24 & 0xff]
        + bin;
    }
    // int 64
    return '\x02'
        + encodeInt64(len)
        + bin;
  }

  encodeArray(arr) {
    const len = arr.length;
    if (len === 0) return '\x00\x03\x00';

    let data;
    if (len <= 0xff) {
      data = '\x00\x03'
        + CHR[len];
    } else if (num <= 0xffff) {
      data = '\x00\x04'
        + CHR[num >> 8]
        + CHR[num & 0xff];
    } else {
      data = '\x00\x05'
        + CHR[num & 0xff]
        + CHR[num >> 8 & 0xff]
        + CHR[num >> 16 & 0xff]
        + CHR[num >> 24 & 0xff];
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
    if (len <= 0xff) {
      data = '\x01\x03'
        + CHR[len];
    } else if (num <= 0xffff) {
      data = '\x01\x04'
        + CHR[num >> 8]
        + CHR[num & 0xff];
    } else {
      data = '\x01\x05'
        + CHR[num & 0xff]
        + CHR[num >> 8 & 0xff]
        + CHR[num >> 16 & 0xff]
        + CHR[num >> 24 & 0xff];
    }

    for (let key, i = 0; i < len; i++) {
      key = keys[i];
      data += this.encodeStr(key);
      data += this.handle(obj[key]);
    }

    return data;
  }
}

module.exports = EncoderLE;
