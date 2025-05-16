The [Raspberry Pi Imager](https://www.raspberrypi.com/software/) uses a <<selectTabMain "Hardware Docs" hard-1881689517 "Card reader" "SD card reader">> to burn the Zero operating system onto a <<selectTabMain "Hardware Docs" hard-1881689517 "SD Card" "SD card">>.

The system will be a [headless](https://raspberrytips.com/raspberry-pi-headless-setup/) server which will be getting power from a USB port. So is preferable to use the 'Raspberry Pi OS Lite (64-bit)' image. Is the one without a desktop.

> You can use the 'Raspberry Pi OS (64-bit)' which has the desktop as well, but will consume more power. Plus only have 512 Meg memory so a lot of stuff - like a browser will not run. The desktop will just complicate things.

Instead of but-yet-another RPi imager writeup - go to this [RaspberryTips](https://raspberrytips.com/raspberry-pi-imager-guide/) for instructions on using imager from Windows, macOS, and Linux.

### Options I use
If asks for a device, select 'Raspberry Pi Zero 2 W'

From the 'CHOOSE OS' button, scroll down and open the 'Raspberry Pi OS (other)' option then select 'Raspberry Pi OS Lite (64-bit)'.

<<image-basic "lite.png" width:"65%" align:"center" caption:"" tooltip:"" alt:"">>

Press the gears button to open the 'Advanced Settings' window.

<<image-basic "gear.png" width:"531px" align:"center" caption:"" tooltip:"" alt:"">>

Will probably want to select 'to always use' just in case have problems and need to start over - just sayin'

The entries are fairly self-explanatory. The host name, user name/password, ssh, and WiFi info is important to be able to find and login to the Zero. Select the checkboxes as shown.

I used a hostname of 'rpiwikis', user name 'tiddlywiki' which will be used in the rest of this documentation. 

<<image-basic "advanced.png" width:"531px" align:"center" caption:"" tooltip:"" alt:"">>

Press save and select the 'CHOOSE STORAGE' button. The name of the storage  to select will vary depending if running the imager on a Mac, Windows, or Linux. Just be careful to write to the SD card; NOT your main drive!
