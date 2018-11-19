'use strict';

module.exports = class Encoders {
  static get encodeAsciiBE() { return require('./encodeAsciiBE'); }
  static get encodeAsciiLE() { return require('./encodeAsciiLE'); }
  static get encodeInt64BE() { return require('./encodeInt64BE'); }
  static get encodeInt64LE() { return require('./encodeInt64LE'); }
};
