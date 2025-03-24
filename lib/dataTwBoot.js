const fs = require('fs-extra');
exports.dataTwBoot = function dataTwBoot(dataDir) {
	var dirNames = fs.readdirSync(dataDir, {withFileTypes: true})
			.filter(item => item.isDirectory())
			.map(item => item.name)

	const databases = {};
	dirNames.forEach(name => {
		if (fs.existsSync(`${dataDir}/${name}/tiddlywiki.info`)) {
			const $tw = require('tiddlywiki').TiddlyWiki();
			$tw.boot.argv = [`${dataDir}/${name}`]; // TW output dir
			$tw.boot.boot(() => {
				$tw.syncer.logger.enable = false;
			});
			databases[name] = {$tw: $tw};
		}
	})
	return databases;
}
