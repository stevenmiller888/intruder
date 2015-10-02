
0.1.3 / October 1, 2015

  * Added cli

0.1.2 / September 26, 2015

  * Replaced template strings to support older versions of Node

0.1.0 / September 24, 2015

  * Added back EventEmitter
  * Refactored to use async `exec`
  * Cleanly exited child process so that the wireless card does not get stuck in monitor mode
  * Parsed the cracking results to pass the actual key in the last callback

0.0.3 / September 23, 2015

  * Change `exec` to `execSync`
  * Established clearer flow of execution in `crack`:
    (1) discover wireless networks
    (2) find access point
    (3) sniff channel
    (4) find capture file
    (5) decrypt capture file

0.0.2 / September 23, 2015

  * Added descrypt function

0.0.1 / September 23, 2015

  * Initial release
