'use strict';

var crypto = require('crypto');

module.exports = function rngNode () {
  return crypto.randomBytes(16);
};
