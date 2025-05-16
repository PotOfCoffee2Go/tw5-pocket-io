## Micro-computers, TW5 frontends, and Node.js servers

Have been playing around with using TiddlyWiki single file wikis as web frontends connecting to expressjs server backends which distributes data and code to other devices on the network.

The goals are :

 * Use Tiddlywiki wikis as databases to hold both shared data and code tiddlers
 * Multi-user servers - exchange tiddlers between devices on the network
 * Multiple devices - wireless connectivity (HTTP/BlueTooth) betweeen PCs, tablets, phones, robots, rovers, drones, etc
 * Security a non-issue as used only on my private local network
 * Code changes are dynamic and take effect immediately 

### Requirements
The software can be run on just about any system with Node.js and a browser by cloning the repo, but ...

### Hardware
I wanted to put a dedicated [Raspberry Pi Zero 2 W](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/) microcomputer as the central repository for data and code, the board is $23 USD (already had the cabling, power supply, a heatsink - which probably would be another $30? - guessing).

"At the heart of Raspberry Pi Zero 2 W is RP3A0, a custom-built system-in-package designed by Raspberry Pi in the UK. With a quad-core 64-bit ARM Cortex-A53 processor clocked at 1GHz and 512MB of SDRAM, Zero 2 is up to five times as fast as the original Raspberry Pi Zero."

What is needed is a very small system which can run a linux OS off a SD card, a few 'server' edition TW wikis for the data and code, a Node.js REPL to dynamically evaluate code changes, and process requests to control the flow of data and code throughout system. All of which has to run under 1/2 GB of ram. Piece of cake.


