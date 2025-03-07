exports.config = {
	// Project's Node.js/NPM package
	pkg: require('./package.json'),
	// Startup webservers for All 'server' edition wikis in this diectory
	wikisDir: './wikis',
	// Wiki that will be listed first - it must exist
	defaultWiki: 'notes',

	// Force pocket-io './network/codebase' wiki to be accessable
	//  only from browsers running on localhost
	forceCodebaseLocal: true,

	// The webserver values set here will be applied to all webserver instances
	// Webservers should normally be served on local host (127.0.0.1)
	//  starting on port basePort and increments by one for each server
	// Parameters are configuration parameters supported by WebServer
	//  see https://tiddlywiki.com/static/WebServer%2520Parameters.html`
	//  credential parameters are automatically applied from 'credentials' (below)
	//  Parameters are applied to all webservers
	webserver: {
		host: '127.0.0.1',
		basePort: 8090,
		parameters: []
	},

	// Express proxies to wiki webservers
	//  DNS domain (or IP address) of this computer
	//   note: I'm running on my local network 'raspberrypi' computeer
	//  proxies accessable on network (0.0.0.0)
	//  starting on port basePort
	proxy: {
		domain: 'raspberrypi',
		host: '0.0.0.0',
		basePort: 3000
	},

	// 'npm run credentials' to build credential files
	credentials: {
		// Users allowed access to pocket-io network
		users: {
			'poc2go': { password: 'ppp' },
			'jane': { password: 'do3' },
			'andy': { password: 'smith' },
			'roger': { password: 'm00re' },
		},

		// Default users and webserver authorization
		// Defaults applied to each wiki listed in property 'wikis' (below)
		default: {
			users: ['poc2go', 'jane', 'andy', 'roger'],
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
		},

		// Wikis not listed will run without credentials
		// Only need to specify properties to override default
		wikis: {
			'notes': {}, // use defaults
			'codebase': {
				users: ['poc2go'],
				authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
			},
			'Home': {
				authorization: ['readers=(anon)', 'writers=(authenticated)', 'admin=poc2go'],
			},
			'poc2go': {
				users: ['poc2go'],
			},
			'Shop': {
				users: ['poc2go', 'jane', 'andy'],
			},
			'ShopDashboard': {
				users: ['poc2go', 'jane', 'andy', 'roger'],
			}
		}
	}
}
