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
	// TW Webservers should be served on local host (127.0.0.1)
	//  starting on port basePort and increments by one for each server
	// Parameters are configuration parameters supported by WebServer
	//  see https://tiddlywiki.com/static/WebServer%2520Parameters.html`
	//  applies to all webservers
	webserver: {
		host: '127.0.0.1',
		basePort: 8090,
		authorization: [
			'readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'
		],
		parameters: []
	},

	// Express proxies to above wikis
	//  DNS domain (or IP address) of this computer
	//    domain is my raspberrypi computeer
	//  proxy available on network (0.0.0.0)
	//  starting on port basePort
	proxy: { domain: 'raspberrypi', host: '0.0.0.0', basePort: 3000 },

	credentials: {
		// Users allowed access to pocket-io network
		users: {
			'poc2go': { password: 'ppp' },
			'jane': { password: 'do3' },
			'andy': { password: 'smith' },
			'roger': { password: 'm00re' },
		},

		// Defaults applied to each wiki unless overridden below
		// Default users
		// Default authorization
		default: {
			users: ['poc2go'],
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
		},

		// Credentials for specific wikis
		// 'npm run credentials' to build credential files
		wikis: {
			'codebase': {
				authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
				users: ['poc2go'],
			},
			'Home': {
				authorization: ['readers=(anon)', 'writers=(authenticated)', 'admin=poc2go'],
				users: ['poc2go', 'jane', 'andy', 'roger'],
			},
			'notes': {
				users: ['poc2go', 'jane', 'andy', 'roger'],
			},
			'poc2go': {
				users: ['poc2go'],
			},
			'Shop': {
				users: ['poc2go', 'jane', 'andy', 'roger'],
			},
			'ShopDashboard': {
				users: ['poc2go', 'jane', 'andy', 'roger'],
			}
		}
	}
}
