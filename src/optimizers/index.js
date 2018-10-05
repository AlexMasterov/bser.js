exports.toDouble = require('./ieee754').toDouble;
exports.utf8toBin = require('./utf8').utf8toBin;
exports.bufToUtf8 = require('./utf8').bufToUtf8;

exports.FastBuffer = Buffer[Symbol.species];
