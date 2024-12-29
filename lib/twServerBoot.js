// Boot a 'server' edition Webserver

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

// TiddlyWiki on Node.js 'server' edition Webserver
const { TwSyncServer } = require('./twSyncServer');

// Boot a $tw instance to the 'server' edition wiki
//  twi text of tiddlywiki instance to Webserver = '$ds' or '$cw' or '$dw'
//  wikiDir = directory path to 'server' edition wiki
//  host = webserver host'0.0.0.0' or '127.0.0.1'
//  port = webserver port
//  enableBrowserAccess = startup a webserver to the wiki - true/false
exports.twServerBoot = function twServerBoot(twi, WikiDir, host, port, enableBrowserAccess) {
	return new Promise((resolve) => {
		const $tw = require('tiddlywiki').TiddlyWiki();
		$tw.boot.argv = [WikiDir]; // TW 'server' edition wiki
		$tw.boot.boot(() => {
			if (enableBrowserAccess === true) {
				var twServer = new TwSyncServer(twi, $tw, host, port, resolve)
				twServer.twListen();
			} else {
				hog(`\n'${WikiDir}' TiddlyWiki Webserver disabled\n`,9);
				resolve($tw);
			}
		});
	})
}
