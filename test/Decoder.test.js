'use strict';

const assert = require('assert');
const { Decoder } = require('../src');
const { toBuf, types } = require('./stub/types');

function test(stub) {
  stub.forEach(({ name, value: expected, LE }) => {
    const decoder = new Decoder();
    it(name, () => {
      const buffer = toBuf(LE);
      const actual = decoder.decode(buffer);

      assert.deepStrictEqual(actual, expected);
    });
  });
}

describe('Decoder', () => {
  const skip = [
    'int64 overflow',
  ];

  const tests = Object.entries(types)
    .filter(([name]) => skip.indexOf(name) === -1);

  for (const [name, stub] of tests) {
    describe(name, () => test(stub));
  }
});
