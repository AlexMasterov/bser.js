'use strict';
/* istanbul ignore file */

const {
  decodeInt64BE,
  decodeInt64LE,
  encodeInt64BE,
  encodeInt64LE,
} = global.BigInt ? require('./bigint') : require('./int64');

module.exports = class Methods {
  static get decodeInt64BE() { return decodeInt64BE; }
  static get decodeInt64LE() { return decodeInt64LE; }
  static get encodeInt64BE() { return encodeInt64BE; }
  static get encodeInt64LE() { return encodeInt64LE; }
};
