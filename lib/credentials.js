const fs = require('node:fs');
const path = require('node:path');

// Helpers
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const cpy = (obj) => JSON.parse(JSON.stringify(obj));

module.exports = function wikiCredentials(config) {
	const { wikisDir, credentials } = config;
	const { wikis } = credentials;
	const users = require(config.credentials.userInfoFile);

	const credFilename = (name) => path.join(config.credentials.csvDir,`${name}.csv`);
	const csvFirstline = 'username,password\n';
	const userLine = (name) => users[name] ? `${name},${users[name].password}\n` : '';

	const lookupAuthorization = (name) => {
		var auth = cpy(config.credentials.default.authorization);
		if (config.credentials.wikis[name] && config.credentials.wikis[name].authorization) {
			auth = config.credentials.wikis[name].authorization;
		}
		if (config.credentials.wikis[name]) {
			auth.push(`credentials=${credFilename(name)}`);
		}
		return auth;
	}

	const buildCsv = (name) => {
		var text = csvFirstline;
		wikis[name].users.forEach(user => {
			text += userLine(user);
		})
		return text;
	}

	// ----------------
	function getWikiNames() {
		var wikiNames = fs.readdirSync(wikisDir, {withFileTypes: true})
			.filter(dir => dir.isDirectory())
			.map(dir => dir.name)
			.filter(name => fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`))
		// Add codebase wiki
		wikiNames.push('codebase');
		return wikiNames;
	}

	function buildCredFiles(wikiNames) {
		var credFiles = {};
		wikiNames.forEach(name => {
			if (typeof wikis[name] === 'object') {
				if (!wikis[name].users || (wikis[name].users.length === 0)) {
					wikis[name].users = config.credentials.default.users;
				}
				credFiles[name] = {
					filename: credFilename(name),
					authorization: lookupAuthorization(name),
					users: wikis[name].users,
					text: buildCsv(name)
				}
			}
		})
		return credFiles
	}

	var fileCount = 0;
	function writeCredFiles(credFiles) {
		for (const name in credFiles) {
			if (!fs.existsSync(credFiles[name].filename)) {
				if (fileCount === 0) {
					hog(`Build webserver Credentials`, 156);
				}
				fs.writeFileSync(credFiles[name].filename, credFiles[name].text);
				hog(credFiles[name].filename, 40);
				hog(`Credential CSV file created for wiki '${name}'`, 156);
				fileCount++;
			}
			delete credFiles[name].text;
		}
		if (fileCount) {
			hog(`${fileCount} credential CSV file${fileCount === 1 ? '' : 's'} created\n`, 156);
		}
		return credFiles;
	}

	return writeCredFiles(buildCredFiles(getWikiNames()));
}
