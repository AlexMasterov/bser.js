import path from 'path';

const int64BE = `
    const num = (this.buffer[this.offset] << 24
      | this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3]) * 0x100000000
      + this.buffer[this.offset + 4] * 0x1000000
      + (this.buffer[this.offset + 5] << 16
        | this.buffer[this.offset + 6] << 8
        | this.buffer[this.offset + 7]);
`;

const int64LE = `
    const num = (this.buffer[this.offset]
      | this.buffer[this.offset + 1] << 8
      | this.buffer[this.offset + 2] << 16)
      + this.buffer[this.offset + 3] * 0x1000000
      + (this.buffer[this.offset + 4]
        | this.buffer[this.offset + 5] << 8
        | this.buffer[this.offset + 6] << 16
        | this.buffer[this.offset + 7] << 24) * 0x100000000;
`;

const patchDecoder = (code, endian) => code
// decodeInt64
  .replace(/\s+i32i64\[1\][^;]+;\r\n/, '')
  .replace(/[\s]+i32i64\[0\][^;]+;\r\n/, (endian === 'BE') ? int64BE : int64LE)
  .replace(/(return) i64\[[01]\]/, '$1 num')
// types
  .replace(/,?[\s]+i64,?/g, '')
  .replace(/\s+const i32i64[^;]+;/g, '');

const patchEncoder = code => code
  .replace(/\s+case BigNum[^;]+/, '')
// encodeBigInt => encodeInt
  .replace(/\s+encodeBigInt\(.+[^}]+}[^}]+}/, '')
  .replace(/(\s+this.encodeFloat[^;]+;)/, '$1\r\n    this.encodeBigInt = this.encodeInt;')
// types
  .replace(/,?[\s]+(u|i)64,?/g, '')
  .replace(/\s+const (u|i)8(u|i)64[^;]+;/g, '')
;

const fromCharCodeToCHR = code => code
  .replace(/(const CHR) = [^;]+;/, `$1 = require('ascii-chr')`)
  .replace(/(CHR)\((.+)\)/g, '$1[$2]');

const removeBigIntArray = code => code
  .replace(/\s+const (u|i)64[^;]+;/g, '')
  .replace(/[\s]+(u|i)64,?/g, '');

export default {
  transform(code, id) {
    const { name } = path.parse(id);

    switch (name) {
      case 'binary':
      case 'EncoderBE':
      case 'EncoderLE':
      case 'encodeAsciiBE':
      case 'encodeAsciiLE':
      case 'encodeInt64BE':
      case 'encodeInt64LE':
        code = fromCharCodeToCHR(code);
    }

    switch (name) {
      case 'binary': return removeBigIntArray(code);
      case 'DecoderBE': return patchDecoder(code, 'BE');
      case 'DecoderLE': return patchDecoder(code, 'LE');
    }

    switch (name) {
      case 'EncoderBE':
      case 'EncoderLE':
        return patchEncoder(code);
    }

    return code;
  },
};
