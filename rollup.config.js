const patcher = (input, file, patch) =>
  ({ input, output: { dir: 'src/legacy', file, format: 'cjs' }, plugins: [patch] });

export default [
  patcher('./src/EncoderBE.js', 'EncoderBE.js', patchEncoder()),
  patcher('./src/EncoderLE.js', 'EncoderLE.js', patchEncoder()),
  patcher('./src/DecoderBE.js', 'DecoderBE.js', patchDecoder()),
  patcher('./src/DecoderLE.js', 'DecoderLE.js', patchDecoder()),
];

function patchEncoder() {
  return {
    transform(code) {
      return code
      // CHR() => CHR[]
        .replace(/(CHR)\((.+)\)/g, '$1[$2]')
      // types
        .replace(/[, ]+u64[, ]/, ' ')
        .replace(/[, ]+i64[, ]/, ' ')
        .replace(/const (u8u64|i8i64|BigNum)(?:[^;]+)/g, '')
      // encodeBigInt => encodeInt
        .replace(/(constructor.+)/, '$1\r\n    this.encodeBigInt = this.encodeInt;')
        .replace(/\s+case ('bigint'|BigNum)(?:[^;]+)/, '')
        .replace(/if \(bignum < 0\)[^}]+}\r\n/, '')
        .replace(/\s+encodeBigInt\(bignum\)[^}]+}/, '');
    },
  };
}

function patchDecoder() {
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

  return {
    transform(code, id) {
      const isBE = id.endsWith('DecoderBE.js');
      return code
      // types
        .replace(/[, ]+i64[, ]+/, ' ')
        .replace(/const i32i64.+\r\n/g, '')
      // decodeInt64
        .replace(/\s+i32i64\[1\][^;]+;\r\n/g, '')
        .replace(/i32i64\[0\][^;]+;\r\n/g, isBE ? int64BE : int64LE)
        .replace(/(return) i64\[0\]/, '$1 num');
    },
  };
}
