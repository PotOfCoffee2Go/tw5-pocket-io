// TiddlyWiki instance for the REPL
"use strict";

exports.replTwBoot = function replTwBoot() {
	return new Promise((resolve) => {
		const $tw = require('tiddlywiki').TiddlyWiki();
		$tw.boot.argv = ['repl-tw']; // TW output dir
		$tw.boot.boot(() => {
			resolve($tw);
		});
	})
}
