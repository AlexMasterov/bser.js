module.exports = class FastBser {
  static get EncoderBE() { return require('./EncoderBE'); }
  static get DecoderBE() { return require('./DecoderBE'); }
  static get EncoderLE() { return require('./EncoderLE'); }
  static get DecoderLE() { return require('./DecoderLE'); }
};
