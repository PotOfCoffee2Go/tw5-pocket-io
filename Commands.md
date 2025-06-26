Network information

Enter these commands from a terminal window from any computer on the network
```
ping rpiwikis.local
arp -a | grep rpiwikis
```

Zip compresses a directory into a single file. Is handy when moving a directory between computers.

Setup :
```
mkdir -p ~/zips # create a folder in home directory put zip files
```
Navigate to the directory to be compressed into a single file then :
```
zip -r ~/zips/snapshot.zip .
ls -al ~/zips
``` 