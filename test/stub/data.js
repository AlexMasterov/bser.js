'use strict';

const { CHR, utf8toBin } = require('../../src/optimizers');

const byte = (...bytes) => Buffer.from(bytes);
const byteN = (value, repeat) => Buffer.allocUnsafe(repeat).fill(value);
const byteStrN = (value, length) => {
  let data = '';
  for (let key, i = 0; i < length; i++) {
    key = utf8toBin(String(i));
    data += '\x02\x03' + CHR[key.length] + key + value;
  }
  return Buffer.from(data, 'binary');
};

const strN = (value, repeat) => value.repeat(repeat);
const arrN = (value, repeat) => new Array(repeat).fill(value);
const objN = (value, size) => {
  const obj = {};
  while (size > 0) {
    size -= 1;
    obj[size] = value;
  }
  return obj;
};

module.exports = {
  arrN,
  byte,
  byteN,
  byteStrN,
  objN,
  strN,
};
