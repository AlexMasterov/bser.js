'use strict';

const assert = require('assert');
const { DecoderBE, DecoderLE } = require('../src');
const { toBuf, types } = require('./stub');

function testBE(stub) {
  for (const { name, value: expected, BE } of stub) {
    const decoder = new DecoderBE();
    it(`${name} BE`, () => {
      const buffer = toBuf(BE);
      const actual = decoder.decode(buffer);

      assert.deepStrictEqual(actual, expected);
    });
  }
}

function testLE(stub) {
  for (const { name, value: expected, LE } of stub) {
    const decoder = new DecoderLE();
    it(`${name} LE`, () => {
      const buffer = toBuf(LE);
      const actual = decoder.decode(buffer);

      assert.deepStrictEqual(actual, expected);
    });
  }
}

describe('Decoder', () => {
  const tests = Object.entries(types);

  for (const [name, stub] of tests) {
    describe(name, () => {
      testBE(stub);
      testLE(stub);
    });
  }
});
