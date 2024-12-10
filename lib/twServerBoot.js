const { TwSyncServer } = require('./twSyncServer');

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

exports.twServerBoot = function twServerBoot(WikiDir, host, port, enableBrowserAccess) {
	return new Promise((resolve) => {
		tw = require('tiddlywiki').TiddlyWiki();
		tw.boot.argv = [WikiDir]; // TW 'server' edition wiki
		tw.boot.boot(() => {
			if (enableBrowserAccess === true) {
				var twServer = new TwSyncServer(tw, host, port, resolve)
				twServer.twListen();
			} else {
				hog(`\n'${WikiDir}' TiddlyWiki Webserver disabled\n`,9);
				resolve(tw);
			}
		});
	})
}
