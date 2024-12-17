// proxy to Dashboard webserver
var $dashlisten = function (next) {
	$dash = new $rt.ProxyServer(`${proxyTargetIp}:${dashPort}`);
	if (true) { // (dashboardWebserver) {
		$dash.listen(dashProxyPort, proxyhost, () => {
			log(`\n$dash dashboard proxy server to ` + hue($dash.proxyTarget,156) + ` started`)
			hog(`Serving on http://${proxyhost}:${dashProxyPort}`,185);
			return next;
		})
	} else {
		hog(`\n$dash dashboard proxy server disabled\n TiddlyWiki Webserver was disabled`,9);
		return next;
	}
}



// Reverse proxy with Pocket.io sockets to
//   TW 'server' edition dash wiki
/*
 *  $dash initially contains:
var $dash = {
	proxyTarget: 'http://127.0.0.1:8082',
}
 *  proxyTarget is whatever configured in ./servers.js
 * ./servers.js will perform the listen()
*/

// ----------------------
// $dash proxy server
/*
$dash.app = express();
$dash.http = http.Server($dash.app);
$dash.pocketio = pocketio($dash.http);
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
*/