'use strict';

const { CHR } = require('../binary');

function encodeInt64LE(hi, lo) {
  return CHR(lo & 0xff)
    + CHR(lo >> 8 & 0xff)
    + CHR(lo >> 16 & 0xff)
    + CHR(lo >> 24 & 0xff)
    + CHR(hi & 0xff)
    + CHR(hi >> 8 & 0xff)
    + CHR(hi >> 16 & 0xff)
    + CHR(hi >> 24 & 0xff);
}

module.exports = encodeInt64LE;
