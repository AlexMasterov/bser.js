'use strict';

const assert = require('assert');
const { Encoder: EncoderLE } = require('../src');
const { toBuf, types } = require('./stub/types');

function test(stub) {
  const encoderLE = new EncoderLE();

  for (const { name, value, LE } of stub) {
    it(`${name} LE`, () => {
      const actual = encoderLE.encode(value);
      const expected = toBuf(LE).latin1Slice();

      assert.deepStrictEqual(actual, expected);
    });
  }
}

describe('Encoder', () => {
  const tests = Object.entries(types);
  for (const [name, stub] of tests) {
    describe(name, () => test(stub));
  }
});
