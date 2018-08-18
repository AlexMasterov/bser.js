'use strict';

const assert = require('assert');
const { Decoder } = require('../src');
const { genBin, types } = require('./stub');

function test(stub, bigEndian=false) {
  const decoder = new Decoder();

  stub.forEach(({ name, value: expected, bin }) => {
    if (bigEndian) bin = bin.reverse();
    it(name, () => {
      const buffer = Buffer.from(genBin(bin), 'binary');
      const actual = decoder.decode(buffer);

      assert.deepStrictEqual(actual, expected);
    });
  });
}

describe('Decoder', () => {
  const todo = [
    'real',
    'int64 safe int',
    'bigint64',
  ];

  const tests = Object.entries(types)
    .filter(([name]) => todo.indexOf(name) === -1);

  for (const [name, stub] of tests) {
    describe(name, () => test(stub));
  }
});
