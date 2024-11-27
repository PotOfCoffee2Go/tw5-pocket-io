// Pocket.io socket & reverse proxy to
//   TW 'server' edition data wiki
/*
 *  $data initially contains:
var $data = {
    // proxyTarget is whatever configured in ./server.js
	proxyTarget: 'http://127.0.0.1:8082',
	express: require('express')
	httpProxy: require('http-proxy'),
	cors: require('cors')
}
 * ./server.js will perform the listen()
 *   after this code runs
*/

// ----------------------
// Pocket.io $data server
$data.app = $data.express();
$data.http = require('node:http').Server($data.app);
$data.io = require('pocket.io')($data.http);

// Allow all to access
// handle some rare CORS cases
$data.app.options('*', $data.cors());
$data.app.use($data.cors());

// Routes - add express routes to this router
//  see code wiki 'REST' Project for examples
$data.router = $data.express.Router();
$data.app.use($data.router);

// Static content directories
$data.app.use($data.express.static('public'));
$data.app.use('/docs', $data.express.static('docs'));

// Reverse-proxy to the TW server edition data wiki
// The proxy to TW wiki must be defined last
// Handles all requests after those handled above
$data.twProxy = $data.httpProxy.createProxyServer();
$data.app.all('/*', (req, res) => {
	$data.twProxy.web(req, res, {target: $data.proxyTarget});
});
