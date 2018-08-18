'use strict';

const { toDouble } = require('./ieee754');

const Int64Array = new BigInt64Array(1);
const Int8Int64Array = new Int8Array(Int64Array.buffer);

class DecoderLE {
  constructor() {
    this.buffer = null;
    this.offset = 0;
    this.length = 0;
  }

  decode(buffer, start = 0, end = buffer.length) {
    this.buffer = buffer;

    if (start === 0) {
      this.offset += 2; // skip header
      this.length = this.decodePDU();
    } else {
      this.offset = start;
      this.length = start + end;
    }

    return this.parse();
  }

  parse() {
    const byte = this.buffer[this.offset++];

    switch (byte) {
      case 0x0a: return null;
      case 0x09: return false;
      case 0x08: return true;

      case 0x07: return this.decodeFloat64();

      case 0x03: return this.decodeInt8();
      case 0x04: return this.decodeInt16();
      case 0x05: return this.decodeInt32();
      case 0x06: return this.decodeInt64();

      case 0x02: return this.decodeStr(this.parse());
      case 0x00: return this.decodeArray(this.parse());
      case 0x01: return this.decodeObject(this.parse());

      case 0x0b: return this.decodeTemplate();
    }
  }

  decodePDU() {
    const byte = this.buffer[this.offset++];

    if (byte === 0x03) return this.decodeInt8();
    if (byte === 0x04) return this.decodeInt16();
    if (byte === 0x05) return this.decodeInt32();
    return this.decodeInt64();
  }

  decodeFloat64() {
    const hi = this.buffer[this.offset]
        | this.buffer[this.offset + 1] << 8
        | this.buffer[this.offset + 2] << 16
        | this.buffer[this.offset + 3] * 0x1000000;

    const lo = this.buffer[this.offset + 4]
        | this.buffer[this.offset + 5] << 8
        | this.buffer[this.offset + 6] << 16
        | this.buffer[this.offset + 7] * 0x1000000;

    this.offset += 8;

    return toDouble(hi, lo);
  }

  decodeInt8() {
    const num = this.buffer[this.offset++];
    return num & 0x80 ? num - 0x100 : num;
  }

  decodeInt16() {
    const num = this.buffer[this.offset]
      | this.buffer[this.offset + 1] << 8;

    this.offset += 2;

    return num & 0x8000 ? num - 0x10000 : num;
  }

  decodeInt32() {
    const num = this.buffer[this.offset]
      | this.buffer[this.offset + 1] << 8
      | this.buffer[this.offset + 2] << 16
      | this.buffer[this.offset + 3] << 24;

    this.offset += 4;

    return num;
  }

  decodeInt64() {
    Int8Int64Array[0] = this.buffer[this.offset];
    Int8Int64Array[1] = this.buffer[this.offset + 1];
    Int8Int64Array[2] = this.buffer[this.offset + 2];
    Int8Int64Array[3] = this.buffer[this.offset + 3];
    Int8Int64Array[4] = this.buffer[this.offset + 4];
    Int8Int64Array[5] = this.buffer[this.offset + 5];
    Int8Int64Array[6] = this.buffer[this.offset + 6];
    Int8Int64Array[7] = this.buffer[this.offset + 7];

    this.offset += 8;

    return Int64Array[0];
  }

  decodeStr(len) {
    return this.buffer.utf8Slice(
      this.offset++,
      this.offset += len - 1
    );
  }

  decodeArray(size) {
    const array = new Array(size);
    for (let i = 0; i < size; i++) {
      array[i] = this.parse();
    }

    return array;
  }

  decodeObject(size) {
    const obj = {};
    while (size--) {
      obj[this.parse()] = this.parse();
    }

    return obj;
  }

  decodeTemplate() {
    const keys = this.parse();
    const size = this.parse();

    const array = new Array(size);
    for (let i = 0; i < size; ++i) {
      const obj = {};
      for (let idx = 0; idx < keys.length; ++idx) {
        if (this.buffer[this.offset] === 0x0c) {
          this.offset++;
          continue;
        }
        obj[keys[idx]] = this.parse();
      }
      array[i] = obj;
    }

    return array;
  }
}

module.exports = DecoderLE;
