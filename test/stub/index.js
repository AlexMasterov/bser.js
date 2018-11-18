'use strict';

const toBuf = bin => Buffer.from([0x00, 0x01, ...bin]);

module.exports = {
  toBuf,
  stub: require('./stub'),
};
