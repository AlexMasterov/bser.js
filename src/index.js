'use strict';

const { endianness } = require('os');

const endian = endianness();

const Encoder = require(`./Encoder${endian}`);
const Decoder = require(`./Decoder${endian}`);

module.exports = {
  Decoder,
  Encoder,
};
