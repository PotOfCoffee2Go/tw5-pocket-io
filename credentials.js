const fs = require('fs');
const { config } = require('./config');
const { wikisDir, credentials } = config;
const { users, wikis } = credentials;

const credFilename = (name) => `./network/credentials/${name}.csv`;
const csvFirstline = 'username,password\n';
const userLine = (name) => users[name] ? `${name},${users[name].password}\n` : '';

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
			credFiles[name] = {
				filename: credFilename(name),
				text: buildCsv(name)
			}
		}
	})
	return credFiles
}

function writeCredFiles(credFiles) {
	for (const name in credFiles) {
		console.dir(credFiles[name]);
		// fs.writeFileSync(credFiles[name].filename, credFiles[name].text);
	}
}

writeCredFiles(buildCredFiles(getWikiNames()));
