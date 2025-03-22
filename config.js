const path = require('node:path');
const os = require('node:os');

exports.config = {
	// Project's NPM package
	pkg: require('./package.json'),

	// Startup webservers for all 'server' edition wikis in this diectory
	wikisDir: './wikis',
	// Wiki in wikisDir that will be listed first - it must exist
	defaultWiki: 'Home',

	// Automatically startup Node-Red
	// If not auto started, can {up-arrow} at 'tw5-node-red > '
	//  console prompt (or type) 'const $nr = new $NodeRed'
	autoStartNodeRed: true,

	// Force tw5-node-red  './network/codebase' wiki to be accessable
	//  only from browsers running on localhost
	// Overrides other configuration settings for codebase wiki
	hideCodebase: true,

	// Express proxies to each webserver
	// Proxies are normally accessable to network (0.0.0.0)
	// The domain is used to create URLs (links) for users to access
	//  other wikis on the network
	// Change domain to the DNS domain (or IP address) of this computer
	//   and host to 0.0.0.0 so devices on network have access.
	// Proxies are starting on port 'basePort' and increment by one
	//   to access each webserver (see 'webserver:' below)
	proxy: {
//		domain: 'localhost',
//		host: '127.0.0.1',
		domain: 'raspberrypi',
		host: '0.0.0.0',
		basePort: 3000,
	},

	// Webservers are launched for each 'server' edition wiki in 'wikisDir:'
	// Should normally be served on localhost (127.0.0.1) as access is
	//  performed thru the proxies (see 'proxy:' above)
	// Starting on port basePort and increments by one for each webserver
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

	// Node-Red setttings
	//   Uses the default settings as much as possible
	// Make changes in the Node-Red settings.js file as usual
	// The properties below will override settings in Node-Red settings.js
	nodered: {
		// Can override flow editor default host & port
		// uiHost: 127.0.0.1,
		// uiPort: 1880,

		// URL path to Node-Red flow editor and http nodes
		httpAdminRoot: '/red',
		httpNodeRoot:  '/api',

		// Node-Red flowFile
		flowFile: path.resolve('./red/flows/tiddlywiki.json'),

		// Point to Node-Red default user directory
		//  which contains the node-red 'settings.js' file
		userDir: os.homedir() + '/.node-red',

		// To run a unique Node-Red user for tw5-node-red
		// An unused Node-Red user directory has been
		//  created in the './red' subdirectory
		//  (ie: 'node-red -u ./red' from project directory)
		// Make desired Node-Red setting changes in './red/settings.js'
		// Comment out the default 'userDir' above
		// Uncomment the 'userDir' below
		// 'npm start' will run with a fresh Node-Red user

		// userDir: path.resolve('./red'),
	},

	// Apply Webserver user/password credentials to individual wikis
	//   see 'https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html'
	credentials: {
		// Directory of password CSV files used by webservers
		//  should be outside of the project
		// Default is in the tw5-node-red user directory '~/.tw5-node-red'
		// This path must be a full absolute path with write permissions
		csvDir: os.homedir() + '/.tw5-node-red/credentials/CSV',

		// Demo users - obviously the passwords are exposed in this file
		//  These are the users used in the examples examples below
		demo: {
			"demo":   { "password": "demo" },
			"poc2go": { "password": "ppp" },
			"jane":   { "password": "do3" },
			"andy":   { "password": "smith" },
			"roger":  { "password": "m00re" }
		},

		// User/passwords are in a file outside of project
		//  Will be created on startup if not present
		// This path must be a full absolute path with write permissions
		// users: require( os.homedir() + '/.tw5-node-red/credentials/users.json'),

		// TO-DO: SELF!!! THE CREDENTIAL FILES NEED TO BE PLACED IN .tw5-node-red
		// Implement in ./lib/credentials.js ./lib/checkFiles.js
		users: {
			"demo": { "password": "demo" },
			"poc2go": { "password": "ppp" },
			"jane": { "password": "do3" },
			"andy": { "password": "smith" },
			"roger": { "password": "m00re" }
		},

		// Default users and webserver authorization parameters
		default: {
			users: ['demo', 'poc2go', 'jane', 'andy', 'roger'],
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
		},

		// Users and authorization properties override the defaults
		// Webserver wikis not listed below will run WITHOUT credentials
		//  (entry will be ignored for wikis that do not exist)
		wikis: {
			'Home': {
				authorization: ['anon-username=demo', 'readers=(anon)', 'writers=(authenticated)', 'admin=poc2go'],
			},
			'notes': {}, // Apply default credentials
			'MyWiki':{},
			'twtalk':{},
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
