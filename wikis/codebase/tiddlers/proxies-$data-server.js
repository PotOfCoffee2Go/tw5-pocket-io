// Pocket.io socket & reverse proxy to
//   TW 'server' edition data wiki
/*
 *  $data initially contains:
var $data = {
	proxyTarget: 'http://127.0.0.1:8083',
}
 *  proxyTarget is whatever configured in ./server.js
 * ./server.js will perform the listen()
*/

// ----------------------
// Pocket.io $data server

$data.app = express();
$data.http = http.Server($data.app);
$data.io = io($data.http);
$data.twProxy = httpProxy.createProxyServer();

// Allow all to access
// handle some rare CORS cases
$data.app.options('*', cors());
$data.app.use(cors());

// Routes - add express routes to this router
//  see code wiki 'REST' Project for examples
$data.router = express.Router();
$data.app.use($data.router);

// Static content directories
$data.app.use(express.static('public'));
$data.app.use('/docs', express.static('docs'));

// Reverse-proxy to the TW server edition data wiki
// The proxy to TW wiki must be defined last
// Handles all requests after those handled above
$data.app.all('/*', (req, res) => {
	$data.twProxy.web(req, res, {target: $data.proxyTarget});
});
