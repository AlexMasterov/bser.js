'use strict';
/* istanbul ignore file */
const isNodeXX = process.version[2] !== '.';

module.exports = class FastBser {
  static get EncoderBE() { return isNodeXX ? require('./EncoderBE') : require('./legacy/EncoderBE'); }
  static get DecoderBE() { return isNodeXX ? require('./DecoderBE') : require('./legacy/DecoderBE'); }
  static get EncoderLE() { return isNodeXX ? require('./EncoderLE') : require('./legacy/EncoderLE'); }
  static get DecoderLE() { return isNodeXX ? require('./DecoderLE') : require('./legacy/DecoderLE'); }
};
