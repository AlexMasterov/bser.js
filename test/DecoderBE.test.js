'use strict';

const assert = require('assert');
const { toBuf, types } = require('./stub');

const DecoderBE = require('../src/DecoderBE');

// assets module v8.x can't compare NaN and exceptions
const isNode8 = process.version[1] === '8';
const assertDeepStrictEqualNode8 = (actual, expected) =>
  isNode8 && Number.isNaN(expected)
    ? assert.ok(Number.isNaN(actual))
    : assert.deepStrictEqual(actual, expected);

const testStub = (name, stub) => process =>
  describe(name, () => stub.forEach(({ name, value, BE: buffer }) =>
    it(name, () => process(toBuf(buffer), value))
  ));

const test = (...stubs) => process =>
  stubs.forEach(type => testStub(type, types[type])(process));

describe('Decoder', () => {
  test('null')((buffer, expected) => {
    const decoder = new DecoderBE();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('boolean')((buffer, expected) => {
    const decoder = new DecoderBE();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'int8_t',
    'int16_t',
    'int32_t',
    'int64',
  )((buffer, expected) => {
    const decoder = new DecoderBE();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('real')((buffer, expected) => {
    const decoder = new DecoderBE();
    assertDeepStrictEqualNode8(decoder.decode(buffer), expected);
  });

  test(
    'str8_t',
    'str16_t',
    'str32_t',
    'utf8',
  )((buffer, expected) => {
    const decoder = new DecoderBE();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'arr8_t',
    'arr16_t',
    'arr32_t',
  )((buffer, expected) => {
    const decoder = new DecoderBE();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'obj8_t',
    'obj16_t',
    'obj32_t',
  )((buffer, expected) => {
    const decoder = new DecoderBE();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });
});
