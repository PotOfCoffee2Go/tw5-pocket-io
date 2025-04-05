const fs = require('fs-extra');
const os = require('node:os');
const crypto = require('node:crypto');

module.exports = function (config) {
	const rndom = () => crypto.randomUUID().split('-').pop();

	var dir, file;

	dir = os.homedir + '/.tw5-node-red';
	fs.ensureDirSync(dir);

	file = os.homedir + '/.tw5-node-red/config.js';
	if (!fs.existsSync(file)) {
		try {
			fs.copySync('./network/config.js', file);
		} catch(err) {
			console.log(err);
			console.log(`Unable to copy default config to User directory '.tw5-node-red'`);
			process.exit(10);
		}
	}

	// Insure CSV directory is present
	dir = config.credentials.csvDir;
	fs.ensureDirSync(dir)

	// Insure a user/password file is present
	file = config.credentials.userInfoFile;
	if (typeof config.credentials.demo !== 'object') {
		config.credentials.demo = {};
	}
	if (!fs.existsSync(file)) {
		fs.outputJsonSync(file, config.credentials.demo, {spaces: 2});
	}
}
