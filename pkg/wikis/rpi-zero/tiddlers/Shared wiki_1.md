## Common wikis on local network

### So many devices!
I use many different devices thoughout the day - cell phone, tablets, work computer, personal computer, etc. My main note taking app is TiddlyWiki. For the most part use single file wikis to take notes as many devices do not have Node.js. Finding a note can be problematic as have to remember which device that I saved the note.

To help solve that problem, I run 'server' edition wikis on one of my personal machines started with 

```
tiddlywiki WikiName --listen host=0.0.0.0 port=8081
```
and change the WikiName and port allowing accesss to multiple wikis.

```
http://192.168.1.8:8081
```

> `192.168.1.8` is the local address of the machine with the wikis.

All devices have a browser - so can access the common wikis. Either edit tiddlers directly or drag-n-drop from/to single file wikis on the device.

### TW5 'server' edition
TiddlyWiki Node.js 'server' edition allows multiple devices on the network to concurrently access the same wiki. It does not have tiddler 'locking' - but displays 'Draft of ...' on the bottom if another device is editing a tiddler. Thus know the tiddler is 'in-use' so just leave it alone.

### Upgrade
The wiki can be on any machine on the network, most of my machines end up being rebooted fairly frequently for one reason or another - software updates, clean out background 'ghosts' and bullsh*t, backups, etc. Since I use the common wikis all the time, decided to create a server dedicated to the single task to host the wikis. Can boot, fire up the TW 'server' editions, and forget about it. 

Requires small system that needs to be easy to assemble and well documented. It must be able to have [git](https://git-scm.com/), [Node.js](https://nodejs.org/en), and TiddlyWiki ( `npm install tiddlywiki -g` ) installed. A standalone system which can run a OS with WiFi.  A GUI for the OS is not a must - but is my personal preference.

### Hardware
Being short on cash, I selected a 'Raspberry Pi Zero W'. The board is $23 USD. Kits with computer, case, cabling, power supply, heatsink, etc. are around $50 USD. The OS is [Raspberry Pi OS](https://www.raspberrypi.com/software/) - a port of Linux Debian with GUI. Was able to get the system up and running in a single afternoon (lot of online docs available). 

> "At the heart of Raspberry Pi Zero 2 W is RP3A0, a custom-built system-in-package designed by Raspberry Pi in the UK. With a quad-core 64-bit ARM Cortex-A53 processor clocked at 1GHz and 512MB of SDRAM, Zero 2 is up to five times as fast as the original Raspberry Pi Zero."
> &mdash; www.raspberrypi.com [Raspberry Pi Zero 2 W](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/

### Software
Although the processor is 64-bit, I installed the 32-bit version of the OS which runs fine. The only app that has issues is the browser - [chromium](https://www.chromium.org/Home/). Takes forever to load up - the machine is apparently not big enough to handle it - or I got something not configured right.

### Boot
WiFi and Bluetooth work fine. Both keyboard and mouse are bluetooth. Had to use a USB keyboard on initial install in order to pair the Bluetooth keyboard/mouse - which only used when I boot the system - once running I unplug the monitor/keyboard/mouse which are used on a different.

Has been running for months without reboot. I have not automated the startup of the 'server' edition TiddlyWikis yet - oh well - some day.
