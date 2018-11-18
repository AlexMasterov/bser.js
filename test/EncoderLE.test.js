'use strict';

const { deepStrictEqual } = require('assert');
const { toBuf, stub } = require('./stub');

const { EncoderLE } = require('../src');

const test = (...stubs) => spec => stubs.forEach(name =>
  describe(name, () => stub[name].forEach(({ name, value, LE: bin }) =>
    it(name, () => spec(value, toBuf(bin).latin1Slice()))
  )));

describe('Encoder LE', () => {
  test('null')((value, expected) => {
    const encoder = new EncoderLE();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeNull(), expected.slice(4));
  });

  test('boolean')((value, expected) => {
    const encoder = new EncoderLE();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeBool(value), expected.slice(4));
  });

  test('real')((value, expected) => {
    const encoder = new EncoderLE();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeReal(value), expected.slice(4));
  });

  const integers = [
    'int8_t',
    'int16_t',
    'int32_t',
    'int64_t_safe',
  ];

  test(
    ...integers,
    'int64_t_safe_overflow'
  )((value, expected) => {
    const encoder = new EncoderLE();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeInt(value), expected.slice(4));
  });

  global.BigInt &&
    test(
      ...integers,
      'int64_t'
    )((value, expected) => {
      const encoder = new EncoderLE();
      deepStrictEqual(encoder.encode(BigInt(value)), expected);
    });

  test(
    'str8_t',
    'str16_t',
    'str32_t',
    'utf8',
  )((value, expected) => {
    const encoder = new EncoderLE();
    deepStrictEqual(encoder.encode(value), expected);
  });

  test(
    'arr8_t',
    'arr16_t',
    'arr32_t',
  )((value, expected) => {
    const encoder = new EncoderLE();
    deepStrictEqual(encoder.encode(value), expected);
  });

  test(
    'obj8_t',
    'obj16_t',
    'obj32_t',
  )((value, expected) => {
    const encoder = new EncoderLE();
    deepStrictEqual(encoder.encode(value), expected);
  });
});
