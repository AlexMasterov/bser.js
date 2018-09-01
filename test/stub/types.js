'use strict';

const { CHR, utf8toBin } = require('../../src/optimizers');

const bytes = (...bytes) => Uint8Array.from(bytes);
const bytesN = (value, repeat) => Buffer.allocUnsafe(repeat).fill(value);
const bytesStrN = (value, increment) => {
  let data = '';
  for (let key, i = 0; i < increment; i++) {
    key = utf8toBin(String(i));
    data += '\x02\x03' + CHR[key.length] + key + value;
  }
  return Buffer.from(data, 'binary');
};

const strN = (value, repeat) => value.repeat(repeat);
const arrN = (value, repeat) => new Array(repeat).fill(value);
const objN = (value, increment, obj = {}) => {
  while (--increment >= 0) obj[increment] = value;
  return obj;
};

function toBuf(bin) {
  return Buffer.from([0x00, 0x01, ...bin]);
}

const types = {
  'str8_t 02': [
    { name: 'min (0)', value: '',
      LE: bytes(0x03, 0x03, 0x02, 0x03, 0x00) },
    { name: 'opt (16)', value: strN('a', 16),
      LE: bytes(0x03, 0x13, 0x02, 0x03, 0x10, ...bytesN(0x61, 16)) },
    { name: 'max (127)', value: strN('a', 127),
      LE: bytes(0x04, 0x82, 0x00, 0x02, 0x03, 0x07f, ...bytesN(0x61, 127)) },
  ],
  'str16_t 03': [
    { name: 'min (128)', value: strN('a', 128),
      LE: bytes(0x04, 0x84, 0x00, 0x02, 0x04, 0x80, 0x00, ...bytesN(0x61, 128)) },
    { name: 'max (32767)', value: strN('a', 32767),
      LE: bytes(0x05, 0x03, 0x80, 0x00, 0x00, 0x02, 0x04, 0xff, 0x07f, ...bytesN(0x61, 32767)) },
  ],
  'str32_t 04': [
    { name: 'min (32767)', value: strN('a', 32767),
      LE: bytes(0x05, 0x03, 0x80, 0x00, 0x00, 0x02, 0x04, 0xff, 0x7f, ...bytesN(0x61, 32767)) },
  ],
  // -128 to 127
  'int8_t 03': [
    { name: 'min (-127)', value: -127,
      LE: bytes(0x03, 0x02, 0x03, 0x81) },
    { name: 'max (127)', value: 127,
      LE: bytes(0x03, 0x02, 0x03, 0x7f) },
  ],
  // -32768 to 32767
  'int16_t 04': [
    { name: 'min neg (-128)', value: -128,
      LE: bytes(0x03, 0x03, 0x04, 0x80, 0xff) },
    { name: 'max neg (-32767)', value: -32767,
      LE: bytes(0x03, 0x03, 0x04, 0x01, 0x80) },
    { name: 'min pos (128)', value: 128,
      LE: bytes(0x03, 0x03, 0x04, 0x80, 0x00) },
    { name: 'max pos (32767)', value: 32767,
      LE: bytes(0x03, 0x03, 0x04, 0xff, 0x7f) },
  ],
  // -2147483648 to 2147483647
  'int32_t 05': [
    { name: 'min neg (-32768)', value: -32768,
      LE: bytes(0x03, 0x05, 0x05, 0x00, 0x80, 0xff, 0xff) },
    { name: 'max neg (-2147483647)', value: -2147483647,
      LE: bytes(0x03, 0x05, 0x05, 0x01, 0x00, 0x00, 0x80) },
    { name: 'min pos (32768)', value: 32768,
      LE: bytes(0x03, 0x05, 0x05, 0x00, 0x80, 0x00, 0x00) },
    { name: 'max pos (2147483647)', value: 2147483647,
      LE: bytes(0x03, 0x05, 0x05, 0xff, 0xff, 0xff, 0x7f) },
  ],
  'int64 safe int 06': [
    { name: 'min safe integer', value: -Number.MAX_SAFE_INTEGER,
      LE: bytes(0x03, 0x09, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe0, 0xff) },
    { name: 'max safe integer', value: Number.MAX_SAFE_INTEGER,
      LE: bytes(0x03, 0x09, 0x06, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00) },
  ],
  'int64 overflow': [
    { name: 'min safe integer - 1', value: Number.MIN_SAFE_INTEGER - 1,
      LE: bytes(0x03, 0x09, 0x06, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00) },
    { name: 'max safe integer + 1', value: Number.MAX_SAFE_INTEGER + 1,
      LE: bytes(0x03, 0x09, 0x06, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00) },
  ],
  'real 07': [
    { name: '-Infinity', value: -Infinity,
      LE: bytes(0x03, 0x09, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0xff) },
    { name: 'Infinity', value: Infinity,
      LE: bytes(0x03, 0x09, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x7f) },
    { name: 'NaN', value: NaN,
      LE: bytes(0x03, 0x09, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf8, 0x7f) },
  ],
  'arr8_t 03': [
    { name: 'min (0)', value: [],
      LE: bytes(0x03, 0x03, 0x00, 0x03, 0x00) },
    { name: 'min (127)', value: arrN(null, 127),
      LE: bytes(0x04, 0x82, 0x00, 0x00, 0x03, 0x7f, ...bytesN(0x0a, 127)) },
  ],
  'arr16_t 04': [
    { name: 'min (128)', value: arrN(null, 128),
      LE: bytes(0x04, 0x84, 0x00, 0x00, 0x04, 0x80, 0x00, ...bytesN(0x0a, 128)) },
    { name: 'max (32767)', value: arrN(null, 32767),
      LE: bytes(0x05, 0x03, 0x80, 0x00, 0x00, 0x00, 0x04, 0xff, 0x7f, ...bytesN(0x0a, 32767)) },
  ],
  'arr32_t 05': [
    { name: 'min (32768)', value: arrN(null, 32768),
      LE: bytes(0x05, 0x06, 0x80, 0x00, 0x00, 0x00, 0x05, 0x00, 0x80, 0x00, 0x00, ...bytesN(0x0a, 32768)) },
  ],
  'obj8_t 03': [
    { name: 'min (0)', value: {},
      LE: bytes(0x03, 0x03, 0x01, 0x03, 0x00) },
  ],
  'boolean 08/09': [
    { name: 'true', value: true,
      LE: bytes(0x03, 0x01, 0x08) },
    { name: 'false', value: false,
      LE: bytes(0x03, 0x01, 0x09) },
  ],
  'null 0a': [
    { name: 'null', value: null,
      LE: bytes(0x03, 0x01, 0x0a) },
  ],
};

module.exports = { toBuf, types };
