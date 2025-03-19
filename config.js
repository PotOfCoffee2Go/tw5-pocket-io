const path = require('node:path');
const os = require('node:os');

exports.config = {
	// Project's Node.js/NPM package
	pkg: require('./package.json'),
	// Startup webservers for All 'server' edition wikis in this diectory
	wikisDir: './wikis',
	// Wiki that will be listed first - it must exist
	defaultWiki: 'Home',

	// Force pocket-io './network/codebase' wiki to be accessable
	//  only from browsers running on localhost regardless
	//  of other configuration settings
	forceCodebaseLocal: true,

	// Webservers should normally be served on localhost (127.0.0.1)
	//  starting on port basePort and increments by one for each server
	webserver: {
		host: '127.0.0.1',
		basePort: 8090
	},

	// Express proxies to each webserver (above)
	//  DNS domain (or IP address) of this computer running the program
	//   note: I'm running on my local network 'raspberrypi' computer
	// Proxies are normally accessable to local network (0.0.0.0)
	//  starting on port basePort
	proxy: {
		domain: 'raspberrypi',
		host: '0.0.0.0',
		basePort: 3000,
	},

	// Node-Red setttings
	//   Uses the default settings as much as possible
	// Make changes in the Node-Red settings.js file as usual
	// The properties below will override settings in Node-Red settings.js
	nodered: {
		// Default Node-Red settings and user directory
		settingsFile: os.homedir() + '/.node-red/settings.js',
		userDir: os.homedir() + '/.node-red',

		// Use host & port from Node-Red settings file
		// uiHost: 127.0.0.1,
		// uiPort: 1880,

		// flowFile for this instance of Node-RED
		// Paths to Node-Red flow editor and nodes
		flowFile: path.resolve('./red/flows/tiddlywiki.json'),
		httpAdminRoot:"/red",
		httpNodeRoot: "/api",
	},

	// Parameters are configuration parameters supported by WebServer
	//  see 'https://tiddlywiki.com/static/WebServer%2520Parameters.html`
	// Users and credentials are applied from 'credentials' (see below)
	// Defaults are applied to all wikis
	// Parameters for each wiki listed in property 'wikis' are appended
	//  to the default
	parameters: {
		default: ['debug-level=none'],
	},

	// Apply user/password credentials to wikis
	//   see 'https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html'
	credentials: {
		// Users allowed access to pocket-io network
		// NOTE: To rebuild webserver user info CSV files run 'npm run credentials'
		//  and restart server 'npm start'
		users: {
			'poc2go': { password: 'ppp' },
			'jane': { password: 'do3' },
			'andy': { password: 'smith' },
			'roger': { password: 'm00re' },
		},

		// Default users and webserver authorization parameters
		// Webserver wikis not listed below will run WITHOUT credentials
		// Defaults applied to each wiki listed in property 'wikis' (below)
		default: {
			users: ['poc2go', 'jane', 'andy', 'roger'],
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
		},

		// Users and authorization properties override the defaults
		wikis: {
			'Home': {
				authorization: ['anon-username=Guest', 'readers=(anon)', 'writers=(authenticated)', 'admin=poc2go'],
			},
			'notes': {}, // Apply credentials - use use the defaults
			'codebase': {
				users: ['poc2go'],
				authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
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
