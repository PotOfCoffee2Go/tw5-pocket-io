## Web Servers

### Apache
Apache2 web server will already be running on the Zero as the default web server on port 80. Go to `http://rpiwikis.local` . 

### Python server
The python web server is already installed and when launched defaults to port 8080. The following command will bring it up on port 8400 :

```
python3 -m http.server 8400
```
See [Real Python](https://realpython.com/python-http-server/#how-to-start-pythons-httpserver-in-the-command-line) for usage.

Browse to `http://rpiwikis.local:8400` . The server allows you to navigate the Zero's directory tree in the browser.

### http-server
The Node.js static web server is installed using 'npm' : 

{{http-server}}

See [http-server](https://www.npmjs.com/package/http-server) for usage.

Change directory to any directory on the Zero and enter :
```
http-server -a 0.0.0.0 -p 8600 
```
to start the server. Browse to `http://rpiwikis.local:8600` which will display the directories and files on the Zero. Similar to the python server above. 

Both servers are a convenient way to download a file or two from the Zero (although each file needs to be selected one at a time).

