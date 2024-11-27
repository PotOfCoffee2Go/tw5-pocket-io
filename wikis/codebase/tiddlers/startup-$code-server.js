// Pocket.io socket & reverse proxy to
//   TW 'server' edition code wiki
/*
 *  $code initially contains:
var $code = {
    // proxyTarget is whatever configured in ./server.js
	proxyTarget: 'http://127.0.0.1:8083',
	express: require('express')
	httpProxy: require('http-proxy'),
	cors: require('cors')
}
 * ./server.js will perform the listen()
 *   after this code runs
*/

// ----------------------
// Pocket.io $code server
$code.app = $code.express();
$code.http = require('node:http').Server($code.app);
$code.io = require('pocket.io')($code.http);

// Allow all to access
// handle some rare CORS cases
$code.app.options('*', $code.cors());
$code.app.use($code.cors());

// Routes - add express routes to this router
//  see code wiki 'REST' Project for examples
$code.router = $code.express.Router();
$code.app.use($code.router);

// Static content directories
$code.app.use($code.express.static('public'));
$code.app.use('/docs', $code.express.static('docs'));

// Reverse-proxy to the TW server edition code wiki
// The proxy to TW wiki must be defined last
// Handles all requests after those handled above
$code.twProxy = $code.httpProxy.createProxyServer();
$code.app.all('/*', (req, res) => {
	$code.twProxy.web(req, res, {target: $code.proxyTarget});
});
