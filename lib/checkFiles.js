const fs = require('fs-extra');
const os = require('node:os');
const crypto = require('node:crypto');

module.exports = function () {
	const rndom = () => crypto.randomUUID().split('-').pop();

	// Insure tw5-node-red CSV subdir is present
	var dir = os.homedir() + '/.tw5-node-red/credentials/csv';
	fs.ensureDirSync(dir)

	var file = os.homedir() + '/.tw5-node-red/credentials/users.json';
	if (!fs.existsSync(file)) {
		fs.outputJsonSync(file, {
			demo:{password: 'demo'},
			guest:{password: rndom()},
			},
			{spaces: 2}
		);
	}
}

