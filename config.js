exports.config = {
	// Startup webservers for All 'server' edition wikis in this diectory
	wikisDir: './wikis',
	// Wiki that will be listed first - it must exit
	defaultWiki: 'notes',

	// TW Webservers Will be served on local host (127.0.0.1)
	//  starting on port basePort and increments
	//  by one for each server
	webserver: { host: '127.0.0.1', basePort: 8090 },

	// Express proxies to above wikis
	//  DNS domain (or IP address) of this computer
	//  host available on network (0.0.0.0)
	//  starting on port basePort
	proxy: { domain: 'raspberrypi', host: '0.0.0.0', basePort: 3000 },

	// Project's Node.js/NPM package
	pkg: require('./package.json')
}
