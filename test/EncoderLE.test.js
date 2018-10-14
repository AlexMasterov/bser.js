'use strict';

const assert = require('assert');
const { toBuf, types } = require('./stub');

const EncoderLE  = require('../src/EncoderLE');

const testStub = (name, stub) => process =>
  describe(name, () => stub.forEach(({ name, value, LE: bin }) =>
    it(name, () => process(value, toBuf(bin).latin1Slice()))
  ));

const test = (...stubs) => process =>
  stubs.forEach(type => testStub(type, types[type])(process));

describe('Encoder BE', () => {
  test('null')((value, expected) => {
    const encoder = new EncoderLE();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeNull(), expected.slice(4));
  });

  test('boolean')((value, expected) => {
    const encoder = new EncoderLE();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeBool(value), expected.slice(4));
  });

  test(
    'int8_t',
    'int16_t',
    'int32_t',
    'int64',
  )((value, expected) => {
    const encoder = new EncoderLE();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeInt(value), expected.slice(4));
  });

  test('real')((value, expected) => {
    const encoder = new EncoderLE();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeReal(value), expected.slice(4));
  });

  test(
    'str8_t',
    'str16_t',
    'str32_t',
    'utf8',
  )((value, expected) => {
    const encoder = new EncoderLE();
    assert.deepStrictEqual(encoder.encode(value), expected);
  });

  test(
    'arr8_t',
    'arr16_t',
    'arr32_t',
  )((value, expected) => {
    const encoder = new EncoderLE();
    assert.deepStrictEqual(encoder.encode(value), expected);
  });

  test(
    'obj8_t',
    'obj16_t',
    'obj32_t',
  )((value, expected) => {
    const encoder = new EncoderLE();
    assert.deepStrictEqual(encoder.encode(value), expected);
  });
});
