// Pocket.io socket & reverse proxy to
//   TW 'server' edition code wiki
/*
 *  $code initially contains:
var $code = {
	proxyTarget: 'http://127.0.0.1:8083',
}
 *  proxyTarget is whatever configured in ./server.js
 * ./server.js will perform the listen()
*/

// ----------------------
// Pocket.io $code server

$code.app = express();
$code.http = http.Server($code.app);
$code.io = io($code.http);
$code.twProxy = httpProxy.createProxyServer();

// Allow all to access
// handle some rare CORS cases
$code.app.options('*', cors());
$code.app.use(cors());

// Routes - add express routes to this router
//  see code wiki 'REST' Project for examples
$code.router = express.Router();
$code.app.use($code.router);

// Static content directories
$code.app.use(express.static('public'));
$code.app.use('/docs', express.static('docs'));

// Reverse-proxy to the TW server edition code wiki
// The proxy to TW wiki must be defined last
// Handles all requests after those handled above
$code.app.all('/*', (req, res) => {
	$code.twProxy.web(req, res, {target: $code.proxyTarget});
});
