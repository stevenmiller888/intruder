
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

  it('should take an object of options', function() {
    it('should take an `interval` option', function() {
      var intruder = Intruder({ interval: 20000 });
      assert.equal(intruder.interval, 20000);
    });

    it('should take a `channel` option', function() {
      var intruder = Intruder({ channel: 20 });
      assert.equal(intruder.channel, 20);
    });

    it('should not take a `foo` option', function() {
      var intruder = Intruder({ foo: 20 });
      assert(!intruder.foo);
    });
  });
});
