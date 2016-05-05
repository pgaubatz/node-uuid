'use strict';

// required for IE:
Number.isInteger = Number.isInteger || function (value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};

var test = require('tape');
var isUuid = require('isuuid');
var isBuffer = require('is-buffer');
var uuid = require('./uuid');
var rng = require('./rng');

test('rng()', function (t) {
  var bytes = rng();

  var isUint8Array = (bytes instanceof Uint8Array);
  /* istanbul ignore next */
  t.ok(isUint8Array || isBuffer(bytes), 'should return Uint8Array or Buffer');

  t.equal(bytes.length, 16, 'should have correct length');

  Array.prototype.map.call(bytes, function (byte) {
    t.ok(Number.isInteger(byte), 'should be an integer');
  });

  t.end();
});

test('uuid.parse()', function (t) {
  var expected = [0, 17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238, 255];
  t.deepEqual(uuid.parse('00112233445566778899aabbccddeeff'), expected);
  t.deepEqual(uuid.parse('00112233-4455-6677-8899-aabbccddeeff'), expected);

  [null, undefined, 0, 1, {}, []].forEach(function (val) {
    t.throws(uuid.parse.bind(null, val), /expecting a String/);
  });

  t.throws(uuid.parse.bind(null, '00'), /malformed UUID/);

  t.end();
});

test('uuid.unparse()', function (t) {
  var expected = '00112233-4455-6677-8899-aabbccddeeff';
  t.equal(uuid.unparse([0, 17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238, 255]), expected);

  [null, undefined, 0, 1, {}].forEach(function (val) {
    t.throws(uuid.unparse.bind(null, val), /expecting Array, Uint8Array or Buffer/);
  });

  t.throws(uuid.unparse.bind(null, [0]), /expecting length of 16/);

  t.end();
});

test('uuid.v4()', function (t) {
  var str = uuid.v4();
  t.ok(isUuid(str), 'should return a valid UUID v4');

  var arr = uuid.v4({bytes: true});
  t.ok(Array.isArray(arr), 'should be an array');
  t.equal(arr.length, 16, 'should have a correct length');

  t.end();
});

//
// CREDITS:
//
// The following code has been taken from:
// https://github.com/broofa/node-uuid/blob/master/test/test.js
// Thank you, broofa!
test('randomness check', function (t) {
  var N = 1e4;
  var limit = 2 * 100 * Math.sqrt(1 / N);
  var counts = {};
  var max = 0;
  var i;

  for (i = 0; i < N; i++) {
    var id = uuid.v4();

    // Count digits for our randomness check
    var digits = id.replace(/-/g, '').split('');
    for (var j = digits.length - 1; j >= 0; j--) {
      var digit = digits[j];
      max = Math.max(max, counts[digit] = (counts[digit] || 0) + 1);
    }
  }

  for (i = 0; i < 16; i++) {
    var c = i.toString(16);
    var n = counts[c];

    // 1-3,5-8, and D-F: 1:16 odds over 30 digits
    var ideal = N * 30 / 16;
    if (i == 4) {
      // 4: 1:1 odds on 1 digit, plus 1:16 odds on 30 digits
      ideal = N * (1 + 30 / 16);
    } else if (i >= 8 && i <= 11) {
      // 8-B: 1:4 odds on 1 digit, plus 1:16 odds on 30 digits
      ideal = N * (1 / 4 + 30 / 16);
    } else {
      // Otherwise: 1:16 odds on 30 digits
      ideal = N * 30 / 16;
    }
    var d = divergence(n, ideal);

    t.ok(Math.abs(d) < limit, c + ' | ' + counts[c] + ' (' + d + '% < ' + limit + '%)');
  }

  t.end();

  // Get %'age an actual value differs from the ideal value
  function divergence (actual, ideal) {
    return Math.round(100 * 100 * (actual - ideal) / ideal) / 100;
  }
});
