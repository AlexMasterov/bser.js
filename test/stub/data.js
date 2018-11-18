'use strict';

function byte() {
  return Buffer.from(arguments);
}

const byteN = (value, repeat) => Buffer.allocUnsafe(repeat).fill(value);
const byteStrN = (value, length) => {
  let i = 0, key, data = '';
  while (i < length) {
    key = String(i);
    data += '\x02\x03' + String.fromCharCode(key.length) + key + value;
    i += 1;
  }
  return Buffer.from(data, 'binary');
};

const bint = global.BigInt ? global.BigInt : Number;
const strN = (value, repeat) => value.repeat(repeat);
const arrN = (value, repeat) => new Array(repeat).fill(value);
const objN = (value, size) => {
  const obj = {};
  while (size > 0) obj[size -= 1] = value;
  return obj;
};

module.exports = {
  arrN,
  bint,
  byte,
  byteN,
  byteStrN,
  objN,
  strN,
};
