
/**
 * Dependencies.
 */

var Intruder = require('..');
var assert = require('assert');

/**
 * Tests.
 */

describe('Intruder()', function() {
  it('should be a function', function() {
    assert.equal(typeof Intruder, 'function');
  });

  it('should be a constructor', function() {
    var intruder = new Intruder();
    assert(intruder instanceof Intruder);
  });

  it('should not require the new keyword', function() {
    var intruder = Intruder();
    assert(intruder instanceof Intruder);
  });
});
