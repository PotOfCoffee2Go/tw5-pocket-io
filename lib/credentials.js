const fs = require('node:fs');
const cpy = (obj) => JSON.parse(JSON.stringify(obj));

module.exports = function wikiCredentials(config) {
	const { wikisDir, credentials } = config;
	const { users, wikis } = credentials;

	const credFilename = (name) => `./network/credentials/${name}.csv`;
	const csvFirstline = 'username,password\n';
	const userLine = (name) => users[name] ? `${name},${users[name].password}\n` : '';

	const lookupAuthorization = (name) => {
		var auth = cpy(config.credentials.default.authorization);
		if (config.credentials.wikis[name] && config.credentials.wikis[name].authorization) {
			auth = config.credentials.wikis[name].authorization;
		}
		if (config.credentials.wikis[name]) {
			auth.push(`credentials=../../network/credentials/${name}.csv`);
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

	function writeCredFiles(credFiles) {
		for (const name in credFiles) {
			// console.dir(credFiles[name]);
			//fs.writeFileSync(credFiles[name].filename, credFiles[name].text);
			delete credFiles[name].text;
		}
		return credFiles;
	}

	return writeCredFiles(buildCredFiles(getWikiNames()));
}
