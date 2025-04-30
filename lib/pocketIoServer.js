// Reverse proxy with Pocket.io sockets to
//   TW 'server' edition webserver

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

// Express server and middleware
const http = require('node:http');
const express = require('express');
const cors = require('cors');
const pocketio = require('pocket.io');
const httpProxy = require('http-proxy');

exports.PocketIoServer = function PocketIoServer(config, serverSettings, isPublic) {
	this.isPublic = isPublic;
	
	if (isPublic) {
		this.host = '0.0.0.0';
		this.port = config.proxy.public.port;
	} else {
		this.host = '127.0.0.1';
		this.port = config.proxy.private.port;
	}

	
	this.baseUrls = []; // Wiki names are base URL
	this.links = [];    // Link to the wikis

	// express / http / websockets
	this.app = express();
	this.http = http.Server(this.app);
	this.pocketio = pocketio(this.http);

	// Allow all to access
	this.app.options('*', cors()); // handle some rare CORS cases
	this.app.use(cors());

	// No wiki specified - redirect to first in list
	this.app.get('/', (req, res) => {
		res.redirect(this.links[0]);
	})

	// Insure a baseUrl like '/xx' ends with a '/' = '/xx/'
	this.app.use((req, res, next) => {
		if (this.baseUrls.includes(req.url)) {
			req.url = req.url + '/';
		}
		next();
	});

	// Routes - add express routes to this router
	//  see codebase wiki 'REST' Project for examples
	this.router = express.Router();
	this.app.use(this.router);

	// Static content directories
	this.app.use(express.static('public'));

	//--------
	// helpers
	const accessType = () => this.isPublic ? 'public' : 'private';
	const otherType = () => this.isPublic ? 'private' : 'public';
	const createTwTarget = () => new httpProxy.createProxyServer({
		target: settings.proxy.targetUrl
	});

	// Methods
	// Add each TW WebServer as a proxy target
	this.addTarget = function addTarget(config, settings) {
		// helpers
		const accessType = () => this.isPublic ? 'public' : 'private';
		const otherType = () => this.isPublic ? 'private' : 'public';
		const createTwTarget = () => new httpProxy.createProxyServer({
			target: settings.proxy.targetUrl
		});

		// Proxy server has already been assigned
		if (settings.proxy.server) {
			return settings.proxy.server;
		}

		// Wiki is listed in the other type's list of wikis
		if (config.proxy[otherType()].wikis.includes(settings.name)) {
			return undefined;
		}

		// Wiki is listed as being public (or private)
		//  or not listed so set as the default
		if (config.proxy[accessType()].wikis.includes(settings.name) ||
				accessType() === config.proxy.default) {
			// Make this a private domain and modify link to point to it
			if (accessType() === 'private') {
				settings.proxy.link = settings.proxy.link
					.replace(settings.proxy.domain, 'localhost')
					.replace(/host\:.+\//, `host:${this.port}/`);
				settings.proxy.domain = 'localhost';
			}
			
			// Add to links and base URL lists
			this.links.push(settings.proxy.link);
			settings.proxy.twTarget = createTwTarget();
			this.baseUrls.push(`/${settings.name}`);
			
			// Send any none handled requests to wiki's WebServer
			this.app.all(`/${settings.name}/*`, (req, res) => {
				settings.proxy.twTarget.web(req, res);
			});
			
			return this;
		}

		return undefined;
	}

	// Proxy server listen for connections
	this.proxyListen = function proxyListen(serverSettings, $tpi) {
		return new Promise((resolve) => {
			// pocket-io websocket routes reference functions in the REPL context
			this.pocketio.on('connection', (socket) => {
				socket.on('ackConnect', (wikiName) => $tpi.fn.io.ackConnect(socket, wikiName));
				socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
				socket.on('disconnect', (wikiName) => $tpi.fn.io.disconnect(socket, wikiName));
			})
			// HTTP requests are proxied over to wiki's TW WebServer
			this.http.listen(this.port, this.host, () => {
				resolve();
			})
		})
	}

	return this;
}
