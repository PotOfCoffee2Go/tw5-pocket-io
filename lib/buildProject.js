const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const { program } = require('commander');
const cwd = (fpath) => path.join(process.cwd(), fpath);

module.exports = function () {
	var dir, file;

	program
	  .option('-p, --projectDir <string>', 'TW5-Node-Red project directory', '.tw5-node-red');

	program.parse();

	const opts = program.opts();

	var projectDir = path.join(os.homedir(), opts.projectDir);

	fs.ensureDirSync(path.resolve(projectDir, 'flows'));
	fs.ensureDirSync(path.resolve(projectDir, 'wikis'));
	fs.ensureDirSync(path.resolve(projectDir, 'dbs'));
	fs.ensureDirSync(path.resolve(projectDir, 'credentials/CSV'));

	// Path to the config
	var configPath = path.resolve(projectDir, 'config.js');

	// Insure a config.js
	file = configPath;
	if (!fs.existsSync(file)) {
		try {
			fs.copySync(cwd('network/config.js'), file);
		} catch(err) {
			console.log(err);
			console.log(`Unable to copy default config to Project directory '.tw5-node-red'`);
			process.exit(10);
		}
	}

	// If wikis is empty copy examples from tw5-node-red
	dir = path.resolve(projectDir, 'wikis');
	if (fs.readdirSync(dir).length === 0) {
		fs.copySync(cwd('wikis'), dir);
	}

	// If flows is empty copy tiddlywiki.json from tw5-node-red
	dir = path.resolve(projectDir, 'flows');
	if (fs.readdirSync(dir).length === 0) {
		fs.copySync(cwd('red/flows/tiddlywiki.json'), path.join(dir, 'tiddlywiki.json'));
	}

/*
	// If dbs is empty copy examples from tw5-node-red
	dir = path.resolve(projectDir, 'dbs');
	if (fs.readdirSync(dir).length === 0) {
		fs.copySync(cwd('network/db'), dir);
	}
*/
	// Insure a package.json
	file = path.resolve(projectDir, 'package.json');
	if (!fs.existsSync(file)) {
		var package = {
			"name": "tw5-node-red-project",
			"description": "A TW5-Node-Red Project",
			"version": "0.0.1",
			"private": true,
			"dependencies": {}
		};
		fs.outputJsonSync(file, package, {spaces: 2});
	}

	// Add a README.md
	file = path.resolve(projectDir, 'README.md');
	if (!fs.existsSync(file)) {
		var readme = `# TW5-Node-Red Project by ${os.userInfo().username}@${os.hostname}\n`;
		fs.outputFileSync(file, readme);
	}

	// Add a .gitignore
	file = path.resolve(projectDir, '.gitignore');
	if (!fs.existsSync(file)) {
var gitignore = `# Ignore npm modules directory
/node_modules

# Ignore webserver credentials
/credentials

# Ignore TiddlyWiki wiki story list(s)
\$__StoryList*

# Ignore Node-Red backups
*.json.backup
`;
		fs.outputFileSync(file, gitignore);
	}

	const { config } = require(configPath);

	config.projectDir = projectDir;
	config.projectName = projectDir.split(/\/|\\/).pop();

	// Insure a user/password file is present
	file = config.credentials.userInfoFile;
	if (typeof config.credentials.demo !== 'object') {
		config.credentials.demo = {};
	}
	if (!fs.existsSync(file)) {
		fs.outputJsonSync(file, config.credentials.demo, {spaces: 2});
	}

	return { config };
}
