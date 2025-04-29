const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const { program } = require('commander');
const programDir = (fpath) => path.join(__dirname, '..', fpath);

module.exports = function () {
	var dir, file;

	// Get optional package directory
	program
	  .option('-p, --packageDir <string>', 'TW5-Node-Red project directory', '.tw5-node-red');
	program.parse();
	const opts = program.opts();

	// Is tw5-pocket-io main project - then require the '-p' parameter
	if (fs.existsSync(process.cwd() + '/network')) {
		if (opts.packageDir === '.tw5-node-red') {
			console.log(`The '-p' project directory must be specified when running from a clone of tw5-pocket-io`);
			process.exit(7);
		}
	}

	// Package directory '-p' param not specified
	//  package directory is working directory
	// else package directory is '-p' option
	var userPackageDir;
	if (opts.packageDir === '.tw5-node-red') {
		userPackageDir = process.cwd();
	} else {
		userPackageDir = path.join(os.homedir(), opts.packageDir.replace(/['"\`]/g, ''));
	}
	const packageDir = (fpath) => path.join(userPackageDir, fpath);

	// Path to the config's
	var configPath = packageDir('config.js');
	var configCredPath = packageDir('configCred.js');

	// Insure a config.js and configCred.js
	if (!fs.existsSync(configPath)) {
		try {
			fs.copySync(programDir('pkg/config.js'), configPath);
			fs.copySync(programDir('pkg/configCred.js'), configCredPath);
		} catch(err) {
			console.log(err);
			console.log(`Unable to copy default config's to Project directory '${packageDir}'`);
			process.exit(8);
		}
	}

	const { config } = require(configPath);

	// Check for initial install - has INSTALL.md and author is me - is a new install
	var initialInstall = packageDir('.install.md');
	if (fs.existsSync(initialInstall) && config.pkg.author === 'PotOfCoffee2Go') {
		// Build a new NPM package
		// Remove tw5-node-red package files
		// Will be replaced by the ones in
		//  tw5-pocket-io ./network
		console.log('Initial install of new NPM package...');
		fs.removeSync(packageDir('.install.md'));
		fs.removeSync(packageDir('.git'));
		fs.removeSync(packageDir('package.json'));
		fs.removeSync(packageDir('README.md'));
		fs.removeSync(packageDir('LICENSE'));
		fs.removeSync(packageDir('.gitignore'));

		// The following must match ./pkg/config.js settings
		fs.ensureDirSync(packageDir('dbs'));
		fs.ensureDirSync(packageDir('flows'));
		fs.ensureDirSync(packageDir('public'));
		fs.ensureDirSync(packageDir('wikis'));
		fs.ensureDirSync(packageDir('credentials/csv'));

		// If dbs is empty copy examples from tw5-pocket-io
		dir = packageDir('dbs');
		if (fs.readdirSync(dir).length === 0) {
			fs.copySync(programDir('pkg/dbs'), dir);
		}

		// If flows is empty copy examples from tw5-pocket-io
		dir = packageDir('flows');
		if (fs.readdirSync(dir).length === 0) {
			fs.copySync(programDir('pkg/flows'), dir);
		}

		// If public is empty copy tiddlywiki.json flow from tw5-pocket-io
		dir = packageDir('public');
		if (fs.readdirSync(dir).length === 0) {
			fs.copySync(programDir('pkg/public'), dir);
		}

		// If wikis is empty copy examples from tw5-pocket-io
		dir = packageDir('wikis');
		if (fs.readdirSync(dir).length === 0) {
			fs.copySync(programDir('pkg/wikis'), dir);
		}

		// Insure a package.json
		file = packageDir('package.json');
		if (!fs.existsSync(file)) {
			fs.copySync(programDir('pkg/package.json'), file);
		}

		// Add a README.md
		file = packageDir('README.md');
		if (!fs.existsSync(file)) {
			fs.copySync(programDir('pkg/README.md'), file);
		}

		// Add a LICENSE - default is MIT
		file = packageDir('LICENSE');
		if (!fs.existsSync(file)) {
			fs.copySync(programDir('pkg/LICENSE'), file);
		}

		// Add a .gitignore
		file = packageDir('.gitignore');
		if (!fs.existsSync(file)) {
			fs.copySync(programDir('pkg/gitignore'), file);
		}

		console.log('Initial install of new NPM package complete');
	}

	config.programDir = programDir('');
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
