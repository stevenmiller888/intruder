
/**
 * Dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;

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
 * 	- `minimumIVs` the minimum number of initialization vectors
 * 	- `channel` the network channel
 *
 * @param {Object} opts
 * @api public
 */

function Intruder(opts) {
  if (!(this instanceof Intruder)) return new Intruder(opts);
  EventEmitter.call(this);

  opts = opts || {};

  this.minimumIVs = opts.minimumIVs || 130000;
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

  discover(function(err, networks) {
    var network = parse(ssid, networks);
    if (!network) return done(error('network not found'));

    self.sniff(network)
      .on('data', function(ivs) {
        // ...
      })
      .on('end', function(err, res) {
        // run `aircrack-ng -1 -a 1 -b MAC airportSniff*.cap`
      });
  });
};

/**
 * Sniff network packets with the wireless card in monitor mode.
 *
 * TODO: differentiate en0 from en1
 *
 * @param {Array} network
 * @api public
 */

Intruder.prototype.sniff = function(network) {
  var channel = this.channel || network[2];
  var minimumIVs = this.minimumIVs;
  var bssid = network[1];
  var self = this;

  exec(airport + ' en0 sniff ' + channel);
  
  // (1) read airportSniffXXXXXX.cap: `tcpdump -s 0 -n -e -x -vvv -r /tmp/airportSniffXXXXXX.cap`
  // (2) count the number of IVs
  // (3) if number of ivs > minimumIVs, emit 'end' event, else emit 'data' event with current number of ivs

  return this;
};

/**
 * Discover wireless networks.
 *
 * @param {Function} done
 */

function discover(done) {
  exec(airport + ' --scan', done);
}

/**
 * Parse the access point's bssid and channel.
 *
 * @param {String} ssid
 * @param {String} networks
 */

function parse(ssid, networks) {
  var re = new RegExp(ssid + " (\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}:\\w{2}) -\\d{2}  (\\d+)");

  return networks
    .split('\n')
    .map(function(line) {
      return line.trim().match(re);
    })
    .filter(function(line) {
      return line;
    })[0];
}

/**
 * Error.
 *
 * @param {String} msg
 */

function error(msg) {
  return new Error(msg);
}
