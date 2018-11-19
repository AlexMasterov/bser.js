import downgrade from './rollup/downgrade';
import toV8v62 from './rollup/toV8v62';

export default [
  downgrade({
    distName: 'v8-6.2',
    rootDir: 'src',
    entries: {
      binary: 'binary.js',
      EncoderBE: 'EncoderBE.js',
      EncoderLE: 'EncoderLE.js',
      DecoderBE: 'DecoderBE.js',
      DecoderLE: 'DecoderLE.js',
      'encoders/encodeAsciiBE': 'encoders/encodeAsciiBE.js',
      'encoders/encodeAsciiLE': 'encoders/encodeAsciiLE.js',
      'encoders/encodeInt64BE': 'encoders/encodeInt64BE.js',
      'encoders/encodeInt64LE': 'encoders/encodeInt64LE.js',
    },
    plugins: [toV8v62],
  }),
];
