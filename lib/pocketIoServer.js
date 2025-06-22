// Reverse proxy with Pocket.io sockets to
//   TW 'server' edition webserver
"use strict";
const os = require('node:os');

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const col = (nbr=40) => `\x1b[${nbr}G`;

// Express server and middleware
const http = require('node:http');
const express = require('express');
const cors = require('cors');
const pocketio = require('pocket.io');
const httpProxy = require('http-proxy');

exports.PocketIoServer = function PocketIoServer(config, serverSettings, isPublic) {
	var self = this;
	this.isPublic = isPublic;
	this.defaultWiki = config.defaultWiki;

	if (isPublic) {
		this.host = '0.0.0.0';
		this.port = config.proxy.public.port;
		this.localName = `${config.publicName}:${this.port}`;
	} else {
		this.host = '127.0.0.1';
		this.port = config.proxy.private.port;
		this.localName = `${config.privateName}:${this.port}`;
		this.defaultWiki = 'codebase';
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
		res.redirect(req.url + this.defaultWiki);
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
	this.app.use(express.static(`${config.packageDir}/public`));

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

			// Update settings with this proxy info
			settings.proxy.link = `${this.localName}/${settings.name}`;
			settings.proxy.targetUrl = `http://${settings.webserver.host}:${settings.webserver.port}`;
			settings.proxy.twTarget = createTwTarget();
			settings.proxy.server = this;
			
			// Add wiki name (prefix) to links and base URL lists
			this.baseUrls.push(`/${settings.name}`);
			this.links.push(settings.proxy.link);
			
			// Send any requests not handled by pocket-io to WebServer
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
				socket.on('connect', () => {}); // do nothing - waits for ackConnect
				socket.on('ackConnect', (wikiName) => $tpi.fn.io.ackConnect(socket, wikiName));
				socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
				socket.on('disconnect', (wikiName) => $tpi.fn.io.disconnect(socket, wikiName));
				socket.on('ping', (data) => socket.emit('pong', data));
				socket.on('pong', (data) => {});
			})

			// HTTP requests are proxied over to wiki's TW WebServer
			this.http.listen(this.port, this.host, () => {
				serverSettings.forEach(settings => {
					if (settings.proxy.server === this) {
						log(hue(`  ${settings.name}${col(19)}: `,76) + settings.proxy.link);
					}
				})
				resolve();
			})
		})
	}

	return this;
}
