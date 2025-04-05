const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const { program } = require('commander');
const cwd = (fpath) => path.join(process.cwd(), fpath);

module.exports = function () {
	var dir, file;

	fs.ensureDirSync(os.homedir + '/.tw5-node-red/wikis');
	fs.ensureDirSync(os.homedir + '/.tw5-node-red/dbs');
	fs.ensureDirSync(os.homedir + '/.tw5-node-red/credentials/CSV');

	// Insure a package.json
	file = os.homedir + '/.tw5-node-red/package.json';
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
	file = os.homedir + '/.tw5-node-red/README.md';
	if (!fs.existsSync(file)) {
		var readme = `# TW5-Node-Red Project by ${os.userInfo().username}@${os.hostname}\n`;
		fs.outputFileSync(file, readme);
	}

	// Add a .gitignore
	file = os.homedir + '/.tw5-node-red/.gitignore';
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

	// Default config
	file = os.homedir + '/.tw5-node-red/config.js';
	if (!fs.existsSync(file)) {
		try {
			fs.copySync(cwd('./network/config.js'), file);
		} catch(err) {
			console.log(err);
			console.log(`Unable to copy default config to Project directory '.tw5-node-red'`);
			process.exit(10);
		}
	}




	program
	  .option('-p, --projectDir <string>', 'TW5-Node-Red project directory', '.tw5-node-red');

	program.parse();

	const opts = program.opts();
	if (/^\.+\//.test(opts.projectDir)) {
		prefixDir = process.cwd();
	} else {
		prefixDir = os.homedir();
	}
	var projectDir = path.join(prefixDir, opts.projectDir);

	if (projectDir[projectDir.length-1] === '/') {
		projectDir = projectDir.substring(0,projectDir.length-1);
	}

	var configPath = path.resolve(projectDir, 'config.js');

	const { config } = require(configPath);

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
