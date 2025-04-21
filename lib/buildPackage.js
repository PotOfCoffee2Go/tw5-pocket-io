const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const { program } = require('commander');
const programDir = (fpath) => path.join(__dirname, '..', fpath);

module.exports = function () {
	var dir, file;

	program
	  .option('-p, --packageDir <string>', 'TW5-Node-Red project directory', '.tw5-node-red');

	program.parse();

	const opts = program.opts();

	var userPackageDir = path.join(os.homedir(), opts.packageDir.replace(/['"\`]/g, ''));
	const packageDir = (fpath) => path.join(userPackageDir, fpath);

	fs.ensureDirSync(packageDir('flows'));
	fs.ensureDirSync(packageDir('wikis'));
	fs.ensureDirSync(packageDir('dbs'));
	fs.ensureDirSync(packageDir('credentials/csv'));

	// Path to the config's
	var configPath = packageDir('config.js');
	var configCredPath = packageDir('configCred.js');

	// Insure a config.js
	if (!fs.existsSync(configPath)) {
		try {
			fs.copySync(programDir('network/config.js'), configPath);
			fs.copySync(programDir('network/configCred.js'), configCredPath);
		} catch(err) {
			console.log(err);
			console.log(`Unable to copy default config's to Project directory '${packageDir}'`);
			process.exit(10);
		}
	}

	// If wikis is empty copy examples from tw5-node-red
	dir = packageDir('wikis');
	if (fs.readdirSync(dir).length === 0) {
		fs.copySync(programDir('wikis'), dir);
	}

	// If flows is empty copy tiddlywiki.json from tw5-node-red
	dir = packageDir('flows');
	if (fs.readdirSync(dir).length === 0) {
		fs.copySync(programDir('flows/tiddlywiki.json'), path.join(dir, 'tiddlywiki.json'));
	}

	// Insure a package.json
	file = packageDir('package.json');
	if (!fs.existsSync(file)) {
		var package = {
			"name": "tw5-node-red-project",
			"description": "A TW5-Node-Red Project",
			"version": "0.0.1",
			"private": true
		};
		fs.outputJsonSync(file, package, {spaces: 2});
	}

	// Add a README.md
	file = packageDir('README.md');
	if (!fs.existsSync(file)) {
		var readme = `# TW5-Node-Red Project by ${os.userInfo().username}@${os.hostname}\n`;
		fs.outputFileSync(file, readme);
	}

	// Add a .gitignore
	file = packageDir('.gitignore');
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
	config.packageDir = userPackageDir;
	config.packageName = userPackageDir.split(/\/|\\/).pop();

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
