// Boot a 'server' edition Webserver

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

// TiddlyWiki on Node.js 'server' edition Webserver
const { TwSyncServer } = require('./twSyncServer');

// Boot a $tw instance to the 'server' edition wiki
//  twi text of tiddlywiki instance to Webserver = '$ds' or '$cw' or '$dw'
//  wikiDir = directory path to 'server' edition wiki
//  enableBrowserAccess = startup a webserver to the wiki - true/false
//exports.twServerBoot = function twServerBoot(twi, WikiDir, host, port, enableBrowserAccess) {
exports.twServerBoot = function twServerBoot(settings, enableBrowserAccess = true) {
	const $tw = require('tiddlywiki').TiddlyWiki();
	return new Promise((resolve) => {
		$tw.boot.argv = [settings.folder]; // TW 'server' edition wiki
		$tw.boot.boot(() => {
			if (enableBrowserAccess === true) {
				var twServer = new TwSyncServer($tw, settings)
				twServer.twListen(resolve);
				setTimeout(() => {resolve($tw);}, 500);
			} else {
				hog(`\n'${settings.folder}' TiddlyWiki Webserver disabled\n`,9);
				resolve($tw);
			}
		});
	})
}
