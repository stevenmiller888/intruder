
# intruder (WIP)
[![NPM version][npm-image]][npm-url]
[![build status][circle-image]][circle-url]
[![license][license-image]][license-url]

Wi-Fi network cracking in Node.js. Currently supports WEP encryption.

## Installation

    $ npm install intruder

## Usage

```js
var Intruder = require('intruder');
var intruder = Intruder();

intruder.crack('Home', function(err, key) {
  if (err) throw new Error(err);
  console.log(key);
});
```

## Note

If you do not have [aircrack](https://github.com/aircrack-ng/aircrack-ng), install it with [Homebrew](https://github.com/Homebrew/homebrew):

`brew install aircrack-ng`

or MacPorts:

`sudo port install aircrack-ng`

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
