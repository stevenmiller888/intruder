
# intruder
[![NPM version][npm-image]][npm-url]
[![build status][circle-image]][circle-url]
[![license][license-image]][license-url]

Wi-Fi network cracking in Node.js. Currently supports WEP encryption.

## Installation

    $ npm install intruder

## Note

Intruder is a wrapper over [aircrack-ng](https://github.com/aircrack-ng/aircrack-ng) and its installation is mandatory to Intruder work.
If you do not have, you can follow these steps depending on your platform:

Using [Homebrew](https://github.com/Homebrew/homebrew):

`brew install aircrack-ng`

or MacPorts:

`sudo port install aircrack-ng`

or APT:

`sudo apt-get install aircrack-ng`

or install [Windows binaries](http://aircrack-ng.org/downloads.html), including the ``\bin`` folder on Windows PATH.

## Compatibility

Some **important** functions of aircrack-ng does not work with some wireless card. Read this [aircrack's wiki](http://www.aircrack-ng.org/doku.php?id=compatibility_drivers) article so you can check if your is compatible.

## Usage

Once you have aircrack-ng installed and a compatible chipset/driver 

```js
var Intruder = require('intruder');
var intruder = Intruder();

intruder
  .on('attempt', function(ivs) {
    console.log(ivs);
  })
  .crack('Home', function(err, key) {
    if (err) throw new Error(err);
    console.log(key);
  });
```

## API

### Intruder(options)
Create a new instance of Intruder that can crack a Wi-Fi network.

The available options are:
* `interval`: the time between crack attempts, defaults to 2000000ms
* `channel`: the channel to sniff packets on

#### .crack()

Crack a Wi-Fi network by name:

```js
intruder.crack('My Wi-Fi Network', function(err, key) {
  // ...
});
```

### .on()

Listen for the `attempt` event, which is emitted on each cracking attempt:

```js
intruder.on('attempt', function(ivs) {
  console.log(ivs) // > 80,000 is good
})
```

## Warning

Please do not use this to crack other people's networks. Let's not have anyone going to jail.

## License

[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/intruder.svg?style=flat-square
[npm-url]: https://npmjs.org/package/intruder
[circle-image]: https://img.shields.io/circleci/project/stevenmiller888/intruder.svg
[circle-url]: https://circleci.com/gh/stevenmiller888/intruder
[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://tldrlegal.com/license/mit-license
