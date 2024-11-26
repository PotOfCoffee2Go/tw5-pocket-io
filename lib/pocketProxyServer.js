const cors = require('cors')
const express = require('express');
const httpProxy = require('http-proxy');

// ----------------------
// Pocket.io server
exports.PocketProxyServer = function PocketProxyServer(wiki) {
	this.app = express();
	this.http = require('node:http').Server(this.app);
	this.io = require('pocket.io')(this.http);

	// Allow all to access
	this.app.options('*', cors()); // handles some rare CORS cases
	this.app.use(cors());

	// Routes - add express routes to this router
	//  see $Code wiki 'REST' and 'Router' project for examples
	this.router =  express.Router();
	this.app.use(this.router);

	// Static content directories (optional)
	this.app.use(express.static('public'));
	this.app.use('/docs', express.static('docs'));

	// Reverse-proxy to the TW server edition wiki
	// The proxy must be defined last
	// Handles all requests after those handled above
	this.twProxy = httpProxy.createProxyServer();
	this.app.all('/*', (req, res) => {
		this.twProxy.web(req, res, {target: wiki});
	});

}
