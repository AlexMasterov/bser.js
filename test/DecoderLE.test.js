'use strict';

const { deepStrictEqual, ok } = require('assert');
const { toBuf, stub } = require('./stub');

// assets module v8.x can't compare NaN and exceptions
const isNodeX = process.version[2] === '.';
const assertFloatEqual = (actual, expected) =>
  isNodeX && Number.isNaN(expected)
    ? ok(Number.isNaN(actual))
    : deepStrictEqual(actual, expected);

const { DecoderLE } = require('../src');

const test = (...stubs) => spec => stubs.forEach(name =>
  describe(name, () => stub[name].forEach(({ name, value, LE: bin }) =>
    it(name, () => spec(toBuf(bin), value))
  )));

describe('Decoder LE', () => {
  test('null')((buffer, expected) => {
    const decoder = new DecoderLE();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('boolean')((buffer, expected) => {
    const decoder = new DecoderLE();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('real')((buffer, expected) => {
    const decoder = new DecoderLE();
    assertFloatEqual(decoder.decode(buffer), expected);
  });

  test(
    'int8_t',
    'int16_t',
    'int32_t',
    (global.BigInt ? 'int64_t' : 'int64_t_safe'),
  )((buffer, expected) => {
    const decoder = new DecoderLE();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('int64_t_safe_overflow')((buffer, expected) => {
    const decoder = new DecoderLE();
    const actual = decoder.decode(buffer);
    deepStrictEqual(Number.isFinite(actual), false);
  });

  test(
    'str8_t',
    'str16_t',
    'str32_t',
    'utf8',
  )((buffer, expected) => {
    const decoder = new DecoderLE();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'arr8_t',
    'arr16_t',
    'arr32_t',
  )((buffer, expected) => {
    const decoder = new DecoderLE();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'obj8_t',
    'obj16_t',
    'obj32_t',
  )((buffer, expected) => {
    const decoder = new DecoderLE();
    deepStrictEqual(decoder.decode(buffer), expected);
  });
});
