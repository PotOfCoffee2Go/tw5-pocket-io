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

// ex: proxyTarget = 'http://127.0.0.1:8084',
// ex: filesDir = 'wikis/database/files'

exports.ProxyServer = function ProxyServer() {
	this.app = express();
	this.http = http.Server(this.app);
	this.pocketio = pocketio(this.http);

	// Allow all to access
	this.app.options('*', cors()); // handle some rare CORS cases
	this.app.use(cors());

	// Routes - add express routes to this router
	//  see code wiki 'REST' Project for examples
	this.router = express.Router();
	this.app.use(this.router);

	// Static content directories
	this.app.use(express.static('public'));

	this.addTarget = function addTarget(settings) {
		const twProxy = new httpProxy.createProxyServer({
			target: settings.proxy.targetUrl
		});

		// Reverse-proxy to the TW server edition webserver
		// The proxy to TW webserver must be defined last
		// Handles all requests not already handled above
		this.app.all(`/${settings.name}*`, (req, res) => {
			twProxy.web(req, res);
		});

		return this;
	}

	// Proxy server listen for connections
	this.proxyListen = function proxyListen(serverSettings, $tpi) {
		return new Promise((resolve) => {
			this.pocketio.on('connection', (socket) => {
				socket.on('ackConnect', (wikiName) => $tpi.fn.io.ackConnect(socket, wikiName));
				socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
				socket.on('disconnect', (wikiName) => $tpi.fn.io.disconnect(socket, wikiName));
			})

			
			const { server, domain, port, host, targetUrl } = serverSettings[0].proxy;
			server.http.listen(port, host, () => {
				log(hue(` Proxy to webservers `,185) +
					hue(` serving on `,185) + serverSettings[0].proxy.link);
				resolve();
			})
		})
	}

	return this;
}
