const fs = require('fs-extra');
const os = require('node:os');
const crypto = require('node:crypto');

module.exports = function (config) {
	const rndom = () => crypto.randomUUID().split('-').pop();

	// Insure CSV directory is present
	var dir = config.credentials.csvDir;
	fs.ensureDirSync(dir)

	// Insure a user/password file is present
	var file = config.credentials.userInfoFile;
	if (typeof config.credentials.demo !== 'object') {
		config.credentials.demo = {};
	}
	if (!fs.existsSync(file)) {
		fs.outputJsonSync(file, config.credentials.demo, {spaces: 2});
	}
}
