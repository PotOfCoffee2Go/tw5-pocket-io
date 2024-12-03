// Pocket.io socket & reverse proxy to
//   TW 'server' edition dash wiki
/*
 *  $dash initially contains:
var $dash = {
	proxyTarget: 'http://127.0.0.1:8083',
}
 *  proxyTarget is whatever configured in ./server.js
 * ./server.js will perform the listen()
*/

// ----------------------
// Pocket.io $dash server

$dash.app = express();
$dash.http = http.Server($dash.app);
$dash.io = io($dash.http);
$dash.twProxy = httpProxy.createProxyServer();

// Allow all to access
$dash.app.options('*', cors()); // handle some rare CORS cases
$dash.app.use(cors());

// Routes - add express routes to this router
//  see code wiki 'REST' Project for examples
$dash.router = express.Router();
$dash.app.use($dash.router);

// Static content directories
$dash.app.use(express.static('public'));
$dash.app.use('/docs', express.static('docs'));

// Reverse-proxy to the TW server edition dash wiki
// The proxy to TW wiki must be defined last
// Handles all requests after those handled above
$dash.app.all('/*', (req, res) => {
	$dash.twProxy.web(req, res, {target: $dash.proxyTarget});
});
