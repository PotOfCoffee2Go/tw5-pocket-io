exports.config = {
	// Project's Node.js/NPM package
	pkg: require('./package.json'),
	// Startup webservers for All 'server' edition wikis in this diectory
	wikisDir: './wikis',
	// Wiki that will be listed first - it must exist
	defaultWiki: 'notes',

	// Force pocket-io './network/codebase' wiki to be accessable
	//  only from browsers running on localhost regardless
	//  of configuration settings
	forceCodebaseLocal: true,

	// Webservers should normally be served on localhost (127.0.0.1)
	//  starting on port basePort and increments by one for each server
	webserver: {
		host: '127.0.0.1',
		basePort: 8090
	},

	// Express proxies to to each webserver (above)
	//  DNS domain (or IP address) of this computer running the program
	//   note: I'm running on my local network 'raspberrypi' computer
	// Proxies are normally accessable to local network (0.0.0.0)
	//  starting on port basePort
	proxy: {
		domain: 'raspberrypi',
		host: '0.0.0.0',
		basePort: 3000
	},

	// Parameters are configuration parameters supported by WebServer
	//  see 'https://tiddlywiki.com/static/WebServer%2520Parameters.html`
	// Users and credentials are applied from 'credentials' (see below)
	// Defaults are applied to all wikis
	// Parameters for each wiki listed in property 'wikis' are appended
	//  to the default
	parameters: {
		default: ['debug-level=none'],
		wikis: {
			'Home': ['anon-username=Guest']
		},
	},

	// Apply user/password credentials to wikis
	//   see 'https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html'
	// NOTE: To rebuild webserver user info CSV files run 'npm run credentials'
	//  and restart server 'npm start'
	credentials: {
		// Users allowed access to pocket-io network
		users: {
			'poc2go': { password: 'ppp' },
			'jane': { password: 'do3' },
			'andy': { password: 'smith' },
			'roger': { password: 'm00re' },
		},

		// Default users and webserver authorization parameters
		// Webserver wikis not listed below will run without credentials
		// Defaults applied to each wiki listed in property 'wikis' (below)
		default: {
			users: ['poc2go', 'jane', 'andy', 'roger'],
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
		},

		// Users and authorization properties override the defaults
		wikis: {
			'notes': {}, // Apply credentials - use use the defaults
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
