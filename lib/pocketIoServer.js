// Reverse proxy with Pocket.io sockets to
//   TW 'server' edition webserver
"use strict";

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
	this.isPublic = isPublic;
	
	if (isPublic) {
		this.domain = config.domain;
		this.host = '0.0.0.0';
		this.port = config.proxy.public.port;
		this.allowNodeRedAdmin = config.proxy.public.allowNodeRedAdmin;
		this.allowNodeRedNode = config.proxy.public.allowNodeRedNode;
	} else {
		this.domain = 'localhost';
		this.host = '127.0.0.1';
		this.port = config.proxy.private.port;
		this.allowNodeRedAdmin = config.proxy.private.allowNodeRedAdmin;
		this.allowNodeRedNode = config.proxy.private.allowNodeRedNode;
	}

	this.baseUrls = []; // Wiki names are base URL
	this.links = [];    // Link to the wikis

	this.httpAdminRoot = config.nodered.httpAdminRoot;
	this.httpNodeRoot = config.nodered.httpNodeRoot;
	this.nodeRedLink = 'http://127.0.0.1:1880';

	// Proxy to Node-Red flow editor
	if (this.allowNodeRedAdmin || this.allowNodeRedNode) {
		this.nodered = new httpProxy.createProxyServer({
			target: this.nodeRedLink
		});
	}
	
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
		if (req.url === this.httpAdminRoot || req.url === this.httpNodeRoot) {
			req.url = req.url + '/';
		}
		next();
	});

	// Access to Node-Red flow editor
	if (this.allowNodeRedAdmin) {
		this.app.all(`${this.httpAdminRoot}/*`, (req, res) => {
			this.nodered.web(req, res);
		});
	}
	// Access to Node-Red HTTP nodes
	if (this.allowNodeRedNode) {
		this.app.all(`${this.httpNodeRoot}/*`, (req, res) => {
			this.nodered.web(req, res);
		});
	}

	// Routes - add express routes to this router
	//  see codebase wiki 'REST' Project for examples
	this.router = express.Router();
	this.app.use(this.router);

	// Static content directories
	this.app.use(express.static('public'));

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
			settings.proxy.domain = this.domain,
			settings.proxy.link = `http://${this.domain}:${this.port}/${settings.name}`
			settings.proxy.targetUrl = `http://${settings.webserver.host}:${settings.webserver.port}`;
			settings.proxy.twTarget = createTwTarget();
			settings.proxy.server = this;
			
			// Add wiki name (prefix) to links and base URL lists
			this.links.push(settings.proxy.link);
			this.baseUrls.push(`/${settings.name}`);
			
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
				socket.on('ackConnect', (wikiName) => $tpi.fn.io.ackConnect(socket, wikiName));
				socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
				socket.on('disconnect', (wikiName) => $tpi.fn.io.disconnect(socket, wikiName));
			})

			// HTTP requests are proxied over to wiki's TW WebServer
			this.http.listen(this.port, this.host, () => {
				serverSettings.forEach(settings => {
					if (settings.proxy.server === this) {
						log(hue(`  ${settings.name}${col(16)}: `,76) + settings.proxy.link);
					}
				})
				resolve();
			})
		})
	}

	return this;
}
