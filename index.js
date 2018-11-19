'use strict';

const v8ver = +process.versions.v8.split('.', 2).join('');

module.exports = (v8ver > 66)
  ? require('./src')
  : require('./dist/v8-6.2');
