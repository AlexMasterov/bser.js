'use strict';
/* istanbul ignore file */

function toDouble(x, y) {
  const frac = x + 0x100000000 * (y & 0xfffff);
  const expt = y >> 20 & 0x7ff;
  const sign = y >> 31 === 0 ? 1 : -1;

  if (expt === 0) {
    return frac === 0
      ? sign * 0
      : sign * frac * 2 ** -1074;
  }
  if (expt === 0x7ff) {
    return frac === 0
      ? sign * Infinity
      : NaN;
  }

  return (sign << expt - 1023) * (1 + frac * 2 ** -52);
}

module.exports = { toDouble };