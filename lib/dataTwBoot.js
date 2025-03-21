// TiddlyWiki instance for the REPL
exports.dataTwBoot = function dataTwBoot(folder) {
	const $tw = require('tiddlywiki').TiddlyWiki();
	$tw.boot.argv = [folder]; // TW output dir
	$tw.boot.boot(() => {
		$tw.syncer.logger.enable = false;
	});
	return $tw;
}
