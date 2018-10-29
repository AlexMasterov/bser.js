'use strict';

const CHR = require('ascii-chr');
const FastBuffer = Buffer[Symbol.species];

const f64 = new Float64Array(1);

module.exports = {
  CHR,
  FastBuffer,
  f64,
};
