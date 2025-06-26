## Welcome

This wiki describes setting up a [Raspberry Pi Zero 2 W](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/) to be used as a host for [TiddlyWikis](https://tiddlywiki.com) on the local network.

It is simple to set up a Raspberry Pi as a TiddlyWiki wiki host. Although in this documentation I try to hit many bases to assist in resolving issues if things go sideways.

See [[Installation]] for a condensed step by step.

The Raspberry Pi will be running 'headless' meaning it does not need a monitor/keyboard/mouse as will be accessed by another computer on the network. The 'RPi Zero 2 W' with only 512 Meg memory can run a desktop - but many larger apps will fail for lack of memory.

I am somewhat familiar with the Raspberry Pi family of products - but is a lot about them I don't know. My experience with Pis has always been fun.

### Hardware
This setup is super simple - the Zero and a cable are all that is needed. The hardware section does get into what to get and optional stuff like cases and adapters if desire to use the Zero for other things too.

### Software
All of the software is open source and installed from the web. The operating system is Raspberry Pi OS Lite (64-bit) which is Debian Linux. No experience using the command line is required - just enter the commands given in the software section of this wiki.

Although simple - the most critical part is checking the proper boxes and entering the WiFi login info to your network when creating the SD card boot disk. This is done with the Raspberry Pi Imager which runs on Windows, Mac, or Linux. When done successfully the Zero will boot up connected to the network.
