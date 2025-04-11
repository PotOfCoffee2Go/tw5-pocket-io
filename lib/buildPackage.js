const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const { program } = require('commander');
const cwd = (fpath) => path.join(process.cwd(), fpath);

module.exports = function () {
	var dir, file;

	program
	  .option('-p, --packageDir <string>', 'TW5-Node-Red project directory', '.tw5-node-red');

	program.parse();

	const opts = program.opts();

	var packageDir = path.join(os.homedir(), opts.packageDir);
	packageDir = packageDir.replace(/['"\`]/g, '');

	fs.ensureDirSync(path.resolve(packageDir, 'flows'));
	fs.ensureDirSync(path.resolve(packageDir, 'wikis'));
	fs.ensureDirSync(path.resolve(packageDir, 'dbs'));
	fs.ensureDirSync(path.resolve(packageDir, 'credentials/csv'));

	// Path to the config's
	var configPath = path.resolve(packageDir, 'config.js');
	var configCredPath = path.resolve(packageDir, 'configCred.js');

	// Insure a config.js
	if (!fs.existsSync(configPath)) {
		try {
			fs.copySync(cwd('network/config.js'), configPath);
			fs.copySync(cwd('network/configCred.js'), configCredPath);
		} catch(err) {
			console.log(err);
			console.log(`Unable to copy default config's to Project directory '${packageDir}'`);
			process.exit(10);
		}
	}

	// If wikis is empty copy examples from tw5-node-red
	dir = path.resolve(packageDir, 'wikis');
	if (fs.readdirSync(dir).length === 0) {
		fs.copySync(cwd('wikis'), dir);
	}

	// If flows is empty copy tiddlywiki.json from tw5-node-red
	dir = path.resolve(packageDir, 'flows');
	if (fs.readdirSync(dir).length === 0) {
		fs.copySync(cwd('flows/tiddlywiki.json'), path.join(dir, 'tiddlywiki.json'));
	}

/*
	// If dbs is empty copy examples from tw5-node-red
	dir = path.resolve(packageDir, 'dbs');
	if (fs.readdirSync(dir).length === 0) {
		fs.copySync(cwd('network/db'), dir);
	}
*/
	// Insure a package.json
	file = path.resolve(packageDir, 'package.json');
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
	file = path.resolve(packageDir, 'README.md');
	if (!fs.existsSync(file)) {
		var readme = `# TW5-Node-Red Project by ${os.userInfo().username}@${os.hostname}\n`;
		fs.outputFileSync(file, readme);
	}

	// Add a .gitignore
	file = path.resolve(packageDir, '.gitignore');
	if (!fs.existsSync(file)) {
var gitignore = `# Ignore npm modules directory
/node_modules

# Ignore webserver credentials
/credentials

# Ignore TiddlyWiki wiki story list(s)
\$__StoryList*
\$__Import.tid

# Ignore Node-Red backups
*.json.backup
`;
		fs.outputFileSync(file, gitignore);
	}

	const { config } = require(configPath);
	config.packageDir = packageDir;
	config.packageName = packageDir.split(/\/|\\/).pop();

	// Copy the credentiail settings into the config
	config.credentials = Object.assign({}, config.credentials, require(configCredPath));

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
