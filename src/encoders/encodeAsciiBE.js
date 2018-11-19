'use strict';
/* istanbul ignore file */

const { CHR } = require('../binary');

function encodeAsciiBE(str) {
  const len = str.length;

  // str_t 8
  if (len < 0x80) {
    return '\x02\x03'
        + CHR(len)
        + str;
  }
  // str_t 16
  if (len < 0x8000) {
    return '\x02\x04'
        + CHR(len >> 8 & 0xff)
        + CHR(len & 0xff)
        + str;
  }
  // str_t 32
  if (len < 0x80000000) {
    return '\x02\x05'
        + CHR(len >> 24 & 0xff)
        + CHR(len >> 16 & 0xff)
        + CHR(len >> 8 & 0xff)
        + CHR(len & 0xff)
        + str;
  }
  // str_t 64
  return '\x02'
      + CHR(len >> 24 & 0xff)
      + CHR(len >> 16 & 0xff)
      + CHR(len >> 8 & 0xff)
      + CHR(len & 0xff)
      + str;
}

module.exports = encodeAsciiBE;
