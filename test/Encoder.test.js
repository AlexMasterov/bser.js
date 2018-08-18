'use strict';

const assert = require('assert');
const { Encoder } = require('../src');
const { genBin, types } = require('./stub');

function test(stub, bigEndian=false) {
  const encoder = new Encoder();

  stub.forEach(({ name, value, bin }) => {
    if (bigEndian) bin = bin.reverse();
    it(name, () => {
      const actual = encoder.encode(value);
      const expected = genBin(bin);

      assert.deepStrictEqual(actual, expected);
    });
  });
}

describe('Encoder', () => {
  const tests = Object.entries(types);
  for (const [name, stub] of tests) {
    describe(name, () => test(stub));
  }
});
