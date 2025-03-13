// Reverse proxy with Pocket.io sockets to
//   TW 'server' edition webserver

// Express server and middleware
const http = require('node:http');
const express = require('express');
const cors = require('cors');
const pocketio = require('pocket.io');
const httpProxy = require('http-proxy');
// Websocket to Node-Red
const WebSocket = require('ws');

// ex: proxyTarget = 'http://127.0.0.1:8084',
// ex: filesDir = 'wikis/database/files'

exports.ProxyServer = function ProxyServer(settings) {
	var self = this;
	this.proxyTarget = settings.proxy.targetUrl;
	this.filesDir = settings.webserver.filesDir;

	this.app = express();
	this.http = http.Server(this.app);
	this.pocketio = pocketio(this.http);
	this.nrws = null;

	this.twProxy = new httpProxy.createProxyServer({
		target: this.proxyTarget
	});

	this.nrProxy = httpProxy.createProxyServer({
		target: 'http://127.0.0.1:1880',
	});

	this.pocketio.on('connection', (socket) => {
		if (!self.nrws) {
			self.nrws = new WebSocket('ws://127.0.0.1:1880/test');

			self.nrws.on('error', console.error);

			self.nrws.on('open', function open() {
			});

			self.nrws.on('message', function message(data) {
			  socket.emit('msg', JSON.parse(data));
			});

			self.nrws.on('close', function message(data) {
			  console.log('node-red closed');
			  self.nrws = null;
			});
		}
	})

	// Allow all to access
	this.app.options('*', cors()); // handle some rare CORS cases
	this.app.use(cors());

	// Routes - add express routes to this router
	//  see code wiki 'REST' Project for examples
	this.router = express.Router();
	this.app.use(this.router);

	// Static content directories
	this.app.use(express.static('public'));
	this.app.use('/files', express.static(this.filesDir));

	// Reverse-proxy to the Node-RED server
	this.app.all('/red*', (req, res) => {
		this.nrProxy.web(req, res);
	});

/*
// this works?!!!
this.http.on('upgrade', function (req, socket, head) {
  const { pathname } = new URL(req.url, 'ws://base.url');
	console.log(pathname);
	if (pathname === '/test') {
		self.nrProxy.ws(req, socket, head);
	}
});
*/
	// Reverse-proxy to the TW server edition webserver
	// The proxy to TW webserver must be defined last
	// Handles all requests not already handled above
	this.app.all('/*', (req, res) => {
		this.twProxy.web(req, res);
	});

	return this;
}
