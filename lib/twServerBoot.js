const { TwSyncServer } = require('./twSyncServer');

exports.twServerBoot = function twServerBoot(WikiDir, host, port) {
	return new Promise((resolve) => {
		tw = require('tiddlywiki').TiddlyWiki();
		tw.boot.argv = [WikiDir]; // TW 'server' edition wiki
		tw.boot.boot(() => {
			var twServer = new TwSyncServer(tw, host, port, resolve)
			twServer.twListen();
		});
	})
}
