// TiddlyWiki instance for the REPL
exports.replTwBoot = function replTwBoot() {
	return new Promise((resolve) => {
		tw = require('tiddlywiki').TiddlyWiki();
		tw.boot.argv = ['repl-tw']; // TW output dir
		tw.boot.boot(() => {
			resolve(tw);
		});
	})
}