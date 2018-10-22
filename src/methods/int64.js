'use strict';

function decodeInt64BE() {
  const num = (this.buffer[this.offset] << 24
    | this.buffer[this.offset + 1] << 16
    | this.buffer[this.offset + 2] << 8
    | this.buffer[this.offset + 3]) * 0x100000000
    + this.buffer[this.offset + 4] * 0x1000000
    + (this.buffer[this.offset + 5] << 16
      | this.buffer[this.offset + 6] << 8
      | this.buffer[this.offset + 7]);

  this.offset += 8;

  return num;
}

function decodeInt64LE() {
  const num = (this.buffer[this.offset]
    | this.buffer[this.offset + 1] << 8
    | this.buffer[this.offset + 2] << 16)
    + this.buffer[this.offset + 3] * 0x1000000
    + (this.buffer[this.offset + 4]
      | this.buffer[this.offset + 5] << 8
      | this.buffer[this.offset + 6] << 16
      | this.buffer[this.offset + 7] << 24) * 0x100000000;

  this.offset += 8;

  return num;
}

module.exports = class Int64 {
  static get decodeInt64BE() { return decodeInt64BE; }
  static get decodeInt64LE() { return decodeInt64LE; }
};
