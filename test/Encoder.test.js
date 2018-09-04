'use strict';

const assert = require('assert');
const { EncoderBE, EncoderLE } = require('../src');
const { toBuf, types } = require('./stub/types');

function testBE(stub) {
  const encoder = new EncoderBE();
  for (const { name, value, BE } of stub) {
    it(`${name} BE`, () => {
      const actual = encoder.encode(value);
      const expected = toBuf(BE).latin1Slice();

      assert.deepStrictEqual(actual, expected);
    });
  }
}

function testLE(stub) {
  const encoder = new EncoderLE();
  for (const { name, value, LE } of stub) {
    it(`${name} LE`, () => {
      const actual = encoder.encode(value);
      const expected = toBuf(LE).latin1Slice();

      assert.deepStrictEqual(actual, expected);
    });
  }
}

describe('Encoder', () => {
  const tests = Object.entries(types);
  for (const [name, stub] of tests) {
    describe(name, () => {
      testBE(stub);
      testLE(stub);
    });
  }
});
