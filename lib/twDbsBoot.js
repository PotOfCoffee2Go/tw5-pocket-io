"use strict";

const fs = require('fs-extra');

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

exports.twDbsBoot = function dataTwBoot(dataDir) {
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

// Show a few stats about database wikis
exports.databaseStats = function databaseStats($db) {
	if (Object.keys($db).length === 0) {
		hog('No database wikis to startup', 216);
		return;
	}
	var stats = [];
	var padName = 0, padCount = 0;
	for (let name in $db) {
		padName = padName < name.length ? name.length : padName;
		var count = $db[name].$tw.wiki.filterTiddlers('[!is[system]count[]]').toString();
		padCount = padCount < count.length ? count.length : padCount;
		stats.push({ name: name.padEnd(padName+1, ' '), count: count.padStart(padCount,' ')});
	}
	stats.forEach(stat => {
		hog(` ${stat.name}: ${stat.count} standard records/tiddlers`, 216);
	})
	return $db;
}
