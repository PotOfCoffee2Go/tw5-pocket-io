"use strict";

const fs = require('node:fs');
const path = require('node:path');

// Helpers
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const col = (nbr=40) => `\x1b[${nbr}G`;

module.exports = function wikiCredentials(config) {
	const { wikisDir, credentials } = config;
	const { wikis } = credentials;
	const users = require(config.credentials.userPasswordFile);

	const credFilename = (name) => path.join(config.credentials.csvDir,`${name}.csv`);
	const userLine = (name) => users[name] ? `${name},${users[name].password}\n` : '';

	const buildCsv = (name) => {
		var text = 'username,password\n';
		wikis[name].users.forEach(user => {
			text += userLine(user);
		})
		return text;
	}

	// ----------------
	function getWikiNames() {
		// Get names of server edition wiki directories
		var wikiNames = fs.readdirSync(wikisDir, {withFileTypes: true})
			.filter(dir => dir.isDirectory())
			.map(dir => dir.name)
			.filter(name => fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`))

		// Add codebase wiki
		wikiNames.push('codebase');
		
		// Remove if wiki in config does not exist on disk
		for (const wiki in wikis) {
			if (!wikiNames.includes(wiki)) {
				delete wikis[wiki];
			} 
		}
		return wikiNames;
	}

	function buildCredFiles(wikiNames) {
		var credFiles = {};
		wikiNames.forEach(name => {
			if (typeof wikis[name] !== 'object') {
				wikis[name] = {
					users: config.credentials.default.users,
					authorization: cpy(config.credentials.default.authorization)
				};
			}
			if (!wikis[name].users || (wikis[name].users.length === 0)) {
				wikis[name].users = config.credentials.default.users;
			}
			if (!wikis[name].authorization || (wikis[name].authorization.length === 0)) {
				wikis[name].authorization = cpy(config.credentials.default.authorization);
			}
			wikis[name].authorization.push(`credentials=${credFilename(name)}`);
			credFiles[name] = {
				filename: credFilename(name),
				users: wikis[name].users,
				authorization: wikis[name].authorization,
				text: buildCsv(name)
			}
		})
		return credFiles
	}

	function writeCredFiles(credFiles) {
		var fileCount = 0;
		var logResults = [];
		logResults.push(hue(`Build webserver credential CSV files`, 156));
		for (const name in credFiles) {
			if (!fs.existsSync(credFiles[name].filename)) {
				fs.writeFileSync(credFiles[name].filename, credFiles[name].text);
				logResults.push(hue(` ${name} ${col(13)}: `, 156) + credFiles[name].filename);
				fileCount++;
			}
		}
		logResults.push(hue(`${fileCount} credential CSV file${fileCount === 1 ? '' : 's'} created\n`, 156));
		if (fileCount) {
			log(logResults.join('\n'));
		}
		return credFiles;
	}

	return writeCredFiles(buildCredFiles(getWikiNames()));
}
