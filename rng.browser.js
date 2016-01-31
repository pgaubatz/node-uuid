'use strict';

var crypto = global.crypto || global.msCrypto;

module.exports = function rngBrowser () {
  return crypto.getRandomValues(new Uint8Array(16));
};
