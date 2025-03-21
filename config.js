const path = require('node:path');
const os = require('node:os');

exports.config = {
	// Project's Node.js/NPM package
	pkg: require('./package.json'),
	// Startup webservers for All 'server' edition wikis in this diectory
	wikisDir: './wikis',
	// Wiki in wikisDir that will be listed first - it must exist
	defaultWiki: 'Home',

	// Automatically startup Node-Red
	// If not auto started, can {up-arrow} at prompt and
	//  find (or type) 'const $nr = new $NodeRed'
	autoStartNodeRed: true,

	// Force tw5-node-red  './network/codebase' wiki to be accessable
	//  only from browsers running on localhost
	// Overrides other configuration settings
	forceCodebaseLocal: false,

	// Webservers should normally be served on localhost (127.0.0.1)
	//  starting on port basePort and increments by one for each server
	webserver: {
		host: '127.0.0.1',
		basePort: 8090
	},

	// WebServer parameters
	//  see 'https://tiddlywiki.com/static/WebServer%2520Parameters.html`
	// 'default' is applied to all wikis
	//  See 'credentials' below for assigning Webserver credentials
	parameters: {
		default: ['debug-level=none'],
	},

	// Express proxies to each webserver
	// Proxies are normally accessable to local network (0.0.0.0)
	// The domain is used to create URLs (links) for users to access
	// wikis in the system
	// The default domain is 'localhost' with host '127.0.0.1' - thus
	//    only this computer (running tw5-node-red) can access the system
	//  Change domain to the DNS domain (or IP address) of this computer
	//   and host to 0.0.0.0 so devices on local network have access.
	//  Proxies are starting on port 'basePort' and increment by one
	//   for each proxy to each webserver
	proxy: {
//		domain: 'localhost',
//		host: '127.0.0.1',
		domain: 'raspberrypi',
		host: '0.0.0.0',
		basePort: 3000,
	},

	// Node-Red setttings
	//   Uses the default settings as much as possible
	// Make changes in the Node-Red settings.js file as usual
	// The properties below will override settings in Node-Red settings.js
	nodered: {
		// Can override host & port from Node-Red settings file
		// uiHost: 127.0.0.1,
		// uiPort: 1880,

		// URL paths to Node-Red flow editor and nodes
		httpAdminRoot: '/red',
		httpNodeRoot:  '/api',

		// flowFile
		flowFile: path.resolve('./red/flows/tiddlywiki.json'),

		// Point to Node-Red default user directory which
		//  also contains the node-red 'settings.js' file
		userDir: os.homedir() + '/.node-red',

		// To run a unique Node-Red user for tw5-node-red
		// An unused node-red user directory has been
		//  created in the './red' subdirectory
		//  (ie: 'node-red -u ./red' from project directory)
		// Make desired settings changes in './red/settings.js'
		// Comment the default 'userDir' above
		// Uncomment the 'userDir' below
		// 'npm start' will run with a fresh node-red user

		// userDir: path.resolve('./red'),
	},

	// Apply Webserver user/password credentials to wikis individual wikis
	//   see 'https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html'
	credentials: {
		// Directory of password CSV files used by webservers
		//  should be outside of the project
		// Default is in the tw5-node-red user directory '~/.tw5-node-red'
		// This path must be a full absolute path with write permissions
		csvDir: os.homedir() + '/.tw5-node-red/credentials/CSV',

		// Demo users - obviously the passwords are exposed in this file
		//  For the initial install - these are the users used in the
		//  examples below
		demo: {
			"demo": { "password": "demo" },
			"poc2go": { "password": "ppp" },
			"jane": { "password": "do3" },
			"andy": { "password": "smith" },
			"roger": { "password": "m00re" }
		},

		// User/passwords are in a file outside of project
		//  Will be created on startup if not present
		// This path must be a full absolute path with write permissions
		users: require( os.homedir() + '/.tw5-node-red/credentials/users.json'),

		// Default users and webserver authorization parameters
		default: {
			users: ['demo', 'poc2go', 'jane', 'andy', 'roger'],
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
		},

		// Users and authorization properties override the defaults
		// Webserver wikis not listed below will run WITHOUT credentials
		//  (entry will be ignored for wikis do not exist)
		wikis: {
			'Home': {
				authorization: ['anon-username=demo', 'readers=(anon)', 'writers=(authenticated)', 'admin=poc2go'],
			},
			'notes': {}, // Apply default credentials
			'codebase': {
				users: ['demo', 'poc2go'],
				authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
			},
			'poc2go': {
				users: ['demo', 'poc2go'],
			},
			'Shop': {
				users: ['demo', 'poc2go', 'jane', 'andy'],
			},
			'ShopDashboard': {
				users: ['poc2go', 'jane', 'andy', 'roger'],
			}
		}
	}
}
