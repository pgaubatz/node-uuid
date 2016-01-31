'use strict';

var rng = require('./rng');
var isBuffer = require('is-buffer');
var isArray = Array.isArray;
var reduce = Array.prototype.reduce;
var toArray = Array.prototype.slice;

module.exports = {
  v4: v4,
  parse: parse,
  unparse: unparse
};

function v4 (opts) {
  var bytes = rng();

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return (opts && opts.bytes)
    ? toArray.call(bytes)
    : unparse(bytes);
}

function parse (str) {
  if (typeof str !== 'string') {
    throw new TypeError('expecting a String');
  }

  var bytes = str
    .toLowerCase()
    .match(/[0-9a-f]{2}/g)
    .map(toByte);

  if (bytes.length !== 16) {
    throw new Error('malformed UUID');
  }

  return bytes;
}

function unparse (bytes) {
  if (!isArray(bytes) && !isUint8Array(bytes) && !isBuffer(bytes)) {
    throw new TypeError('expecting Array, Uint8Array or Buffer');
  }
  if (bytes.length !== 16) {
    throw new Error('expecting length of 16');
  }

  return reduce.call(bytes, unparseReducer, '');
}

function unparseReducer (str, bytes, i) {
  return str + dashOrNothing(i) + toHex(bytes);
}

function dashOrNothing (i) {
  return (i === 4 || i === 6 || i === 8 || i === 10)
    ? '-'
    : '';
}

function toByte (hex) {
  return parseInt(hex, 16);
}

function toHex (byte) {
  return (byte + 0x100)
    .toString(16)
    .substr(1);
}

function isUint8Array (bytes) {
  return bytes instanceof Uint8Array;
}
