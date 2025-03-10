# tw-talk writeup

The quality and support of the TiddlyWiki code base is well established; and the community has a long exciting history, is engaged, with no fear of evaporating anytime soon. Is a BIG plus when a company decides to invest a portion of it's future software development on TiddlyWiki.

> **Web Front-end Development** is the process of transforming data to a graphical interface through the usage of CSS, HTML, and JavaScript so that the users can observe and network with that data.

 TiddlyWiki enhances this process by adding features such as [WikiText](https://tiddlywiki.com/static/WikiText.html), [Filters](https://tiddlywiki.com/static/Filters.html]), [Operators](https://tiddlywiki.com/static/Filter%2520Operators.html), and [Templates](https://tiddlywiki.com/static/TemplateTiddlers.html); 

The [SQLite MWS project](https://talk.tiddlywiki.org/t/announcing-the-multiwikiserver-plugin/9033) is an awesome solution for moving TiddlyWiki into the future,  Node.js has an [interest in SQLite](https://nodejs.org/api/sqlite.html), plus many corporations use [SQLite](https://www.sqlite.org/index.html) as an intermediary to hold transient data extracted from their main [MSSQL](https://www.microsoft.com/en-us/sql-server/sql-server-2022), [MongoDB](https://www.mongodb.com/), or the pricey [Oracle](https://en.wikipedia.org/wiki/Oracle_Database) corporate  databases (usually using some type of RESTful API).

---

I decided to take a different approach from the [SQLite MWS project](https://talk.tiddlywiki.org/t/announcing-the-multiwikiserver-plugin/9033) to store and access multiple TW wikis. The main goal is to integrate multiple wikis into a single system which works with existing single file and 'server' edition wikis. ( 'server' edition wikis are also called ['TiddlyWiki on Nodejs'](https://tiddlywiki.com/static/TiddlyWiki%2520on%2520Node.js.html) and ['Webserver'](https://tiddlywiki.com/static/WebServer.html)  - from now on will call use 'Webserver').

Requirements of the system:

1. Operating System independent 
2. Tolerant of TiddlyWiki and external package release updates
3. Server-side JavaScript code is developed, stored, and loaded from TW wikis
4. Node.js environment with access to all wikis
5. Webserver instances present the system to client-side users
6. [Express]() proxy servers allow additional server functionality
7. Secondary [WebSocket](https://en.wikipedia.org/wiki/WebSocket) connection for client-to-client and [out-of-band data](https://en.wikipedia.org/wiki/Out-of-band_data) access between clients and server

## Operating System independent
Due to operating system inconsistencies when  spawning processes - the system can not depend on multiple child processes to perform server side worker tasks as there are subtle differences  when spawning child processes between MS, Mac, and Linux. Thus all tasks must be performed in a single [Node.js event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) - or [Node.js controlled worker threads](https://nodejs.org/api/worker_threads.html). Basically, let Node.js handle all tasks ([promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)) - activating threads as it deems necessary.

## Tolerant of TiddlyWiki and external package release updates
The objective is to use as few external packages as possible, TiddlyWiki being one of them. Overriding TW `$:/core` tiddlers is not acceptable as these tiddlers can change between releases and system maintenance would become a nightmare very quickly. Also, to seamlessly integrate community plugins usually requires unmodified core tiddlers. TW maintains a high degree of  backward  compatibility with each TW release (sometimes exasperating TW Developers) .  However, this attention to back-release compatibility has been the cornerstone of TiddlyWiki's long term success.

## Server-side JavaScript code stored in wikis
The JavaScript code run on the server is stored and dynamically uploaded to the server on startup. One can view this as another 'module' loader similar to [ CJS, AMD, UMD, and ESM](https://irian.to/blogs/what-the-heck-are-cjs-amd-umd-and-esm-in-javascript)
loaders. A TiddlyWiki based 'Project Management System' is available to assist in the building and maintaining custom applications. JavaScript code is selectively uploaded to the server to implement custom applications.

## Node.js environment with access to all wikis
The server runs a [Node.js REPL](https://nodejs.org/api/repl.html) context. This is similar to the 'window' or 'document' object in a browser - but runs on the server. A REPL context has effectively all of the common Node.js objects such as ''fs', os', 'process', 'path', 'http/s',and JavaScript objects such as 'Array', setTimeout', 'setInterval', 'decodeURI' and many more are pre-loaded. Has the disadvantage (similar to the browser 'window' object) one has to take care not to overwrite standard functions. But the advantages far outweigh the disadvantages.

## Webserver instances present the system to client-side users

## [Express]() proxy servers allow additional server functionality




## Secondary WebSocket connection for client-to-client and out-of-band access to server






The REPL has access to the $tw instance for each TW webserver in the network. The complete JavaScript TW codebase is available to act upon a wiki. It is the same $tw instance that is being used by Webserver - thus any changes appear to have been done by Webserver. (eliminating need to re-boot Webserver to see the changes).

As an example - to access all tiddlers tagged 'mytag': 
```js
const $tw = get$tw('MyWiki');
const tiddlers = JSON.parse($tw.wiki.getTiddlersAsJson('[tag[mytag]]'));
console.dir(tiddlers,{depth:2});
```

Any changes to a tiddler in 'MyWiki' wiki will be picked up by any Webserver client connected to the wiki upon the next 'server-refresh' action from the client (more on that later); 
 

TiddlyWiki on Node.js 'server' edition Webserver ( which will call [Webserver](https://tiddlywiki.com/static/WebServer.html) ) keeps the clients connected to the server in 'sync' with the server-side wikis and with each client-side user connected to the wiki. This is a vital function which Webserver does this exceptionally well - so would like to use it as the main client interface.

However, Webserver was developed with simplicity in mind and is not intended to face the open internet. It also has a few limitations:

 1. [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) policies.
 2. Limited authentication/authorization strategies
 3. Addding  application specific routes to Webserver can be a challenge
 4. No easy way to implement client-to-client communications
 5. Updates to the wiki from an external source requires a reboot of webserver
 6. Webserver lacks record (tiddler) locking

The solution I've come up with is to front-end each Webserver with an [express](https://expressjs.com/) server. The express server is then a single access point for all server requests to that wiki. Requests not processed by express are passed on to Webserver via http-proxy middleware.

1. CORS is resolved using the express CORS middleware. All interaction with web requests and Webserver clients is from a single server of origin  - so CORS is relatively simple (well - as simple as CORS can be).

2. express has middleware to handle most common authentication strategies. Basic, Token-Based, OAuth, Passport, to name a few.

3. Routes are added to the express 'router' in the normal express way of adding routes. Requests can be monitored then passed on further down the middleware stack using the express 'next()' mechanism. A common set of routes I add frequently is a [RESTful API](https://aws.amazon.com/what-is/restful-api/) interface to GET and POST changes to the wiki from the web.

4. Along with the standard HTTP requests, an independent bi-directional websocket channel provides application specific requests and client to client communications. This is implemented client-side using a zero-config JavaScript macro imported to the wiki. Server-side is implemented with [pocket.io](https://github.com/WebReflection/pocket.io#readme) package which is a thin wrapper simplifying [websockets](https://en.wikipedia.org/wiki/WebSocket) protocol by using Node.js event emitters and automatically handles converting JavaScript objects for transmission.

5. The webserver implementation requires a reboot of the webserver to pick up external changes to the wiki. This can be overcome by having express use the same $tw instance the Webserver created on startup. By using that instance, is as if Webserver made the changes to the  wiki (even though the change was actually done by express).
    * The websocket channel broadcasts a message to all clients which results in the client doing a `<$action-sendmessage $message="tm-server-refresh">` which immediately picks up any changes to the wiki without delay or requiring a re-boot of webserver.

6. Tiddler locking is implemented server-side. The websocket channel is used to display a 'Tiddler Currently Locked' client-side. I am currently solidifying that interface.

Implementation of the network stack :

```js
// Reverse proxy with Pocket.io sockets to
//   TW 'server' edition webserver

// Express server and middleware
const http = require('node:http');
const express = require('express');
const cors = require('cors');
const pocketio = require('pocket.io');
const httpProxy = require('http-proxy');

// ex: proxyTarget = 'http://127.0.0.1:8084',
// ex: filesDir = 'wikis/database/files' // path to Webserver 'files' directory

exports.ProxyServer = function ProxyServer(proxyTarget, filesDir = 'docs') {
	this.proxyTarget = proxyTarget;
	this.filesDir = filesDir;

	this.app = express();
	this.http = http.Server(this.app);
	this.pocketio = pocketio(this.http);
	this.twProxy = httpProxy.createProxyServer();

	// Allow all to access
	this.app.options('*', cors()); // handle some rare CORS cases
	this.app.use(cors());

	// Routes - add express routes to this router
	//  see code wiki 'REST' Project for examples
	this.router = express.Router();
	this.app.use(this.router);

	// Static content directories
	this.app.use(express.static('public')); // root directory - ie: '/'
	this.app.use('/files', express.static(filesDir));

	// Reverse-proxy to the TW server edition webserver
	// The proxy to TW Webserver must be defined last
	// Handles all requests not already handled above
	this.app.all('/*', (req, res) => {
		this.twProxy.web(req, res, {target: proxyTarget});
	});

	return this;
}
```





The task is to add a [RESTful API](https://aws.amazon.com/what-is/restful-api/) interface server-side for external applications to get and post changes to the wiki. TiddlyWiki Webserver is not really designed to add those routes easily out-of-the-box.

Attempted to use two sites. A TiddlyWiki site running Webserver for users to access the wiki, and a different site that opens the wiki (using $tw.boot) with the REST interface (on different ports). Thus there are two $tw instances referencing the same wiki. Not ideal.

The solution i've come up with is to front-end Webserver with an express server. The server is then a single server access point for all requests.

![tw5-pocket-io-servers-proxy2|513x500](upload://rMllAShsf5g7B5kDMxToMaXMKub.png)

The issues resolved using this network stack:

 1. Updates from REST to the wiki requires a reboot of the TiddlyWiki Webserver for clients to see updates.
 2. [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) policies.
 3. Limited server-side authentication/authorization methods
 4. Webserver lacks record (tiddler) locking and client-to-client communications.

Explained:

1. This is solved by having the REST interface use the same $tw instance that is created by Webserver when launched. Changes to the wiki appear as if done by Webserver.

2. CORS is resolved using the express CORS middleware. All interaction is from a single server - so is relatively simple (well - as simple as CORS can be).

3. express has middleware to handle most common authentication strategies. Basic, Token-Based, OAuth, Passport, to name a few.

4. An independent bi-directional socket channel provides clients communications to server and each other. This is implemented client-side using a JavaScript macro imported to the wiki.

The REST routes are added to the express 'router' in the normal express way of adding routes. Requests can be monitored then passed on further down the stack using the express 'next()' mechanism.

```js
// Route for $data server
//   ex: '/tiddlers/[tag[about]]'
$data.router.get('/tiddlers/:filter', (req, res) => {
	var { filter } = req.params;
	var tiddlers = JSON.parse($tw.wiki.getTiddlersAsJson(filter));
	res.set('content-type', 'application/json');
	res.send(JSON.stringify(tiddlers, null, 4)); // pretty while testing
});
```

Any request not handled by express middleware is passed on to the Webserver via http-proxy for processing. Thus the http-proxy must be the last middleware in the stack.

An important use of the socket channel is to broadcast a message that has the client(s) do a 'tm-server-refresh' when the wiki is updated, thus showing current info in a timely manner. The channel is also used to inform the Webserver clients when tiddlers are 'locked' preventing update collisions.

The socket channel can be used by single file wikis to access the system (needs the socket interface Macro imported). Due to CORS policies the single file wiki must be delivered by the server. This is done by placing the wiki in the './public' directory.



For example:

```
{{||$:/lwr-item/upload-template}}

```

`$:/lwr-item/upload-template` tiddler contains the $select, $button, $edit-text, $checkbox, etc. of the form to enter item information (which is placed in the fields of the tiddler). Webserver updates that tiddler server-side automatically.

From this piont forward - everything requied


I have no desire or need to add or integrate any new features to TiddlyWiki itself, just use what it already has - UI templates, `<<tabs>>`, TableOfContents, $select, $button, $edit-text, $checkbox, etc. (and yes - might change some styles, add a Macro or \define here or there - but it's built to do that.) And have

So, Webserver does a complex task which is needed - but there are few issues with using Webserver as a GUI to the database:
 * Updates from REST need to reflect on the client side TiddlyWikis connected to the server.
   * There is an unacceptable delay in refreshing updates on connected clients.
 * CORS - reliable access from external origins
 * Limited authentication/authorization methods
 *  Webserver lacks broadcast and client-to-client communication.

> BTW, not bitching about it - is the nature of the beast.

The webserver implementation requires a reboot of the webserver to pick up external changes to the wiki. This can be overcome by using the same $tw instance  the 'server' edition webserver created on startup. By usig that instance, client-side 'thinks' webserver made the changes - so a $action-sendmessage 'tm-server-refresh' client-side will pick up the changes.

Initially, the application boots up a 'server' server edition webserver to the database wiki. The $tw instance created is referenced in global namespace so accessible by all components of the application.

The TiddlyWiki Commander is used to launch the webserver. Effectively is same as `tiddlywiki wikis/database --listen port=8084` from the command line.

One could access the webserver directly by going to http://localhost:8084.

The proxy server provides a server-side express server in front of http://localhost:8084.  Going to http://localhost:3002 is identical to http://localhost:8084 - but with additional features implemented in express. Express routes and middleware has access to the wiki using the same $tw instance used by webserver.

CORS middlware handles the [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) policies. The default is to allow any origin.

The [express.Router](http://expressjs.com/en/api.html#router) instance allows adding routes to the proxy server. In my case - creating routes for a [RESTful API](https://aws.amazon.com/what-is/restful-api/) interface to the tiddlers of the './wikis/database' wiki. There are also express middleware routes which handle OAuth (and other) permission methods to the server.

[express.static](http://expressjs.com/en/api.html#express.static) defines the directories containing static content. By default; the '/' (root) path delivers resources from the './public' directory and the '/files' path delivers from the './wikis/database/files' directory.

For example of a route:
```js
// Route for $data server
//   ex: '/tiddlers/[tag[about]]'
$data.router.get('/tiddlers/:filter', (req, res) => {
	var { filter } = req.params;
	var tiddlers = JSON.parse($tw.wiki.getTiddlersAsJson(filter));
	res.set('content-type', 'application/json');
	res.send(JSON.stringify(tiddlers, null, 4)); // insures formatted
});

```

An interesting side effect of the proxy  - '_canonical_uri' files with path `/files` are delivered from 'wikis/database/files' by the proxy - not the webserver.

A socket I/O channel is provided by the [pocket.io](https://github.com/WebReflection/pocket.io#readme) package which is a thin wrapper simplifying [websockets](https://en.wikipedia.org/wiki/WebSocket) protocol by using Node.js event emitters.

> To connect via WebSockets the `$:/poc2go/macro/tw5-pocket-io/network.js` macro must be imported into the wiki.

This channel allows clients to communicate with each other. It also allows the server to 'broadcast' a message to all clients resulting in a client-side `$action-sendmessage 'tm-server-refresh'` which immediately refreshes the client TiddlyWiki with changes from the REST interface.

When a request is not processed by the above middleware stack, it is passed to the 'server' edition Webserver for processing. Thus when connecting to http://localhost:3002 it is as if were connecting directly to http://localhost:8084 (but with the added functionality and REST routes).

I have a test bed on GitHub
