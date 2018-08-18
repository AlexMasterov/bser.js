'use strict';

const B = Uint8Array;

function pdu(value) {
  if (value >= -0x80 && value <= 0x7f) return 0x03;
  if (value >= -0x8000 && value <= 0x7fff) return 0x04;
  if (value >= -0x80000000 && value <= 0x7fffffff) return 0x05;
  return 0x05;
}

function genBin(bin) {
  return Buffer.from([0x00, 0x01, pdu(bin.length), bin.length, ...bin]).latin1Slice(0);
}

const types = {
  boolean: [
    { name: 'true', value: true, bin: B.from([0x08]) },
    { name: 'false', value: false, bin: B.from([0x09]) },
  ],
  real: [
    { name: 'float64', value: 1.3, bin: B.from([0x07, 0xcd, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xf4, 0x3f]) },
  ],
  int8: [
    { name: 'min int8', value: -128, bin: B.from([0x03, 0x80]) },
    { name: 'max int8', value: 66, bin: B.from([0x03, 0x42]) },
  ],
  int16: [
    { name: 'min int16', value: -32768, bin: B.from([0x04, 0x00, 0x80]) },
    { name: 'max int16', value: 4607, bin: B.from([0x04, 0xff, 0x11]) },
  ],
  int32: [
    { name: 'min int32', value: -2147483648, bin: B.from([0x05, 0x00, 0x00, 0x00, 0x80]) },
    { name: 'max int32', value: 287502079, bin: B.from([0x05, 0xff, 0xee, 0x22, 0x11]) },
  ],
  'int64 safe int': [
    { name: 'min safe integer', value: -Number.MAX_SAFE_INTEGER,
      bin: B.from([0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe0, 0xff]) },
    { name: 'max safe integer', value: Number.MAX_SAFE_INTEGER,
      bin: B.from([0x06, 0xff, 0xff, 0xff, 0xff, 0xfe, 0xff, 0x1f, 0x00]) },
  ],
  bigint64: [
    { name: 'min safe integer', value: BigInt(-Number.MAX_SAFE_INTEGER),
      bin: B.from([0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe0, 0xff]) },
    { name: 'max safe integer', value: BigInt(Number.MAX_SAFE_INTEGER),
      bin: B.from([0x06, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00]) },
    { name: 'min int64', value: -9223372036854775808n,
      bin: B.from([0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80]) },
    { name: 'max int64', value: 9223372036854775807n,
      bin: B.from([0x06, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f]) },
  ],
  string: [
    { name: 'emtpy string', value: '', bin: B.from([0x02, 0x03, 0x00]) },
    { name: 'xyz', value: 'xyz', bin: B.from([0x02, 0x03, 0x03, 0x78, 0x79, 0x7a]) },
  ],
  array: [
    { name: 'emtpy array', value: [], bin: B.from([0x00, 0x03, 0x00]) },
  ],
  object: [
    { name: 'emtpy object', value: {}, bin: B.from([0x01, 0x03, 0x00]) },
  ],
};

module.exports = { genBin, types };
