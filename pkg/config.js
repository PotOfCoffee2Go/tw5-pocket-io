const os = require('node:os');
const path = require('node:path');

// User NPM package directory containing this config file
// The NPM package can be specified using the
//  'npm start -- -p <path/to/package>' option
// The default directory is in user home directory '.tw5-node-red'
const packageDir = (fpath) => path.join(__dirname, fpath);

exports.config = {
	// The domain is used to create URLs, access wikis, and
	//  other tw5-node-red resourcess
	// On most OS's 'hostname' is used for local network access
	// If issues arise using the hostname
	//  set the domain to the DNS domain or IP address of this computer
	//  ex: '192.168.1.8' is IP of this computer on my network
	//   yours will be different - finding it varies between OS's
	
	// Local network name of this computer
	domain: os.hostname(),

	// Wiki in wikisDir that will be listed first
	//  if wiki does not exist in 'wikisDir' folder then the first wiki
	//  read from disk becomes the default wiki
	defaultWiki: 'Home',


	// 'server' edition client webserver wikis
	wikisDir: packageDir('wikis'),

	// 'server' edition database wikis
	wikidbsDir: packageDir('dbs'),

	// Automatically startup Node-Red
	// Many server-side actions (topics) are done by Node-Red
	//   recommend to set to 'true'
	// If Node-Red is not auto started, can {up-arrow} at tw5-node-red
	//  console prompt (or type) 'const $nr = new $NodeRed'
	autoStartNodeRed: true,

	// Webservers are launched for each 'server' editon wiki in 'wikisDir:'
	// Access is performed thru the proxies (see 'proxy:' below)
	// Starting on port basePort and increments by one for each webserver
	webserver: {
		basePort: 8090,

		// WebServer parameters
		//  see 'https://tiddlywiki.com/static/WebServer%2520Parameters.html`
		// 'default' is applied to all webservers
		//  See 'credentials' below for assigning Webserver credentials
		parameters: {
			default: []
		},
	},

	// Hide private wiki's (see below) from being displayed
	hidePrivateWikis: true,

	// Reverse proxies to each webserver and Node-Red
	// The 'public' proxy can be accessed by devices on the local network
	// The 'private' proxy can only be accessed by localhost
	// Both proxies are identical except
	//   'public'  listens on host '0.0.0.0'   - access via domain
	//   'private' listens on host '127.0.0.1' - access via 'localhost'
	proxy: { 
		// Default if wiki is not listed  as 'public' or 'private'
		default: 'public',
		// The 'public' proxy allows network devices to access wikis
		public: {
			// public proxy port
			port: 3000,
			// wikis that are always public
			wikis: [ 
				'Home',
				'Test'
			],
			// allow public access to Node-Red flow editor and HTTP nodes
			allowNodeRedAdmin: false,
			allowNodeRedNode: true,
		},

		// The 'private' proxy allows only localhost access to wikis
		private: {
			 // private proxy port
			port: 4000,
			// wikis that are always private
			wikis: [
				'codebase',
				'xx'
			],
			// allow private access to Node-Red flow editor and HTTP nodes
			allowNodeRedAdmin: true,
			allowNodeRedNode: false,
		},
	},

	// Node-Red settings
	//   Uses the default settings in Userdir settings.js file
	// Make changes in the Node-Red settings.js file as usual
	// The properties below will override settings in Node-Red settings.js
	nodered: {
		// Override flow editor default host & port
		// Set uiHost to 127.0.0.1 to allow only the localhost to access
		//  the flow editor
		// uiHost: 0.0.0.0,
		// uiPort: 1880,

		// Node-Red user directory
		//  which contains the node-red 'settings.js' file
		// '.node-red' is default for Node-Red
		userDir: path.join(os.homedir(), '.node-red'),

		// Node-Red flowFile
		flowFile: packageDir('flows/tiddlywiki.json'),

		// Allow 'global' variables to be displayed in flow editor
		//  the default is false
		exportGlobalContextKeys: true,

		// URL path to Node-Red flow editor and http nodes
		httpAdminRoot: '/red',
		httpNodeRoot:  '/api',
	},

	// TiddlyWiki Webserver user/password credentials
	// The system uses the Basic Authentication method
	// see https://tiddlywiki.com/static/WebServer%2520Basic%2520Authentication.html
	// packageDir('credentials') directory is ignored in .gitignore
	// The 'configCred.js' file contains the TiddlyWiki auth settings
	credentials: {
		// This file contains the User/Passwords
		userInfoFile: packageDir('credentials/users.json'),

		// Directory of password CSV files used by webservers
		// Default is in the tw5-node-red user directory '~/.tw5-node-red'
		// see 'https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html'
		csvDir: packageDir('credentials/csv'),
	},

	// tw5-node-red NPM package
	pkg: require(packageDir('package.json')),
}
