const path = require('node:path');
const os = require('node:os');

// Full filepath using the tw5-node-red directory
//  Is the current directory on tw5-node-red startup
const programDir = (fpath) => path.join(process.cwd(), fpath);

// User's NPM package directory containing this config file
//  tw5-node-red '-p' option
const packageDir = (fpath) => path.join(__dirname, fpath);

exports.config = {
	// Wiki in wikisDir that will be listed first - it must exist
	defaultWiki: 'Home',

	// The domain is used to create URLs, access wikis, and
	//  other tw5-node-red resourcess
	// On most OS's 'hostname' is used for local network access
	// If issues arise using the hostname
	//  set the domain to the DNS domain or IP address of this computer
	//  ex: '192.168.1.8' is IP of this computer on my network
	//   yours will be different - finding it varies between OS's
	domain: os.hostname(), // local network name of this computer

	// 'server' edition client webserver wikis
	wikisDir: packageDir('wikis'),

	// 'server' edition database wikis
	wikidbsDir: packageDir('dbs'),

	// Automatically startup Node-Red
	// Many server-side actions (topics) are done by Node-Red
	//   recommend to set to 'true'
	// If not auto started, can {up-arrow} at 'tw5-node-red > '
	//  console prompt (or type) 'const $nr = new $NodeRed'
	autoStartNodeRed: true,

	// Hide codebase wiki from being displayed as a normal client wiki
	//  if true will also only be accessable from localhost
	hideCodebase: true,

	// Webservers are launched for each 'server' editon wiki in 'wikisDir:'
	// Should normally be served on localhost (127.0.0.1) as access is
	//  performed thru the proxies (see 'proxy:' below)
	// Starting on port basePort and increments by one for each webserver
	webserver: {
		host: '127.0.0.1', // this computer has sole access
//		host: '0.0.0.0',   // other network devices have access
		basePort: 8090
	},

	// WebServer parameters
	//  see 'https://tiddlywiki.com/static/WebServer%2520Parameters.html`
	// 'default' is applied to all webservers
	//  See 'credentials' below for assigning Webserver credentials
	parameters: {
		default: ['debug-level=none'],
	},

	// Express proxies to each webserver
	// Proxies are normally accessable to network (0.0.0.0)
	// Proxies are starting on port 'basePort' and increment by one
	//   to access each webserver (see 'webserver:' above)
	proxy: {
//		host: '127.0.0.1', // this computer has sole access
		host: '0.0.0.0',   // other network devices have access
		basePort: 3000,
	},

	// Node-Red setttings
	//   Uses the default settings in Userdir settings.js file
	// Make changes in the Node-Red settings.js file as usual
	//  or keep the settings you already use
	// The properties below will override settings in Node-Red settings.js
	nodered: {
		// Override flow editor default host & port
		// uiHost: 0.0.0.0,
		// uiPort: 1880,

		// Node-Red user directory
		//  which contains the node-red 'settings.js' file
		// '.node-red' is default for Node-Red
		userDir: path.join(os.homedir(), '.node-red'),

		// Node-Red flowFile
		flowFile: packageDir('flows/tiddlywiki.json'),

		// URL path to Node-Red flow editor and http nodes
		httpAdminRoot: '/red',
		httpNodeRoot:  '/api',

		// Allow 'global' variables to be displayed in flow editor
		exportGlobalContextKeys: true,
	},

	// Apply Webserver user/password credentials to individual wikis
	// The system uses the Basic Authentication method
	// see https://tiddlywiki.com/static/WebServer%2520Basic%2520Authentication.html
	credentials: {
		// This path must be a full absolute path with write permissions
		userInfoFile: packageDir('credentials/users.json'),

		// Directory of password CSV files used by webservers
		//  should be outside of the project
		// Default is in the tw5-node-red user directory '~/.tw5-node-red'
		// see 'https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html'
		// This path must be a full absolute path with write permissions
		csvDir: packageDir('credentials/csv'),

	},

	// tw5-node-red  package
	pkg: require(programDir('./package.json')),
}
