"use strict";

const os = require('node:os');
const path = require('node:path');

// User NPM package directory containing this config file
// The NPM package can be specified using the
//  'npm start -- -p <path/to/package>' option
// The default directory is in user home directory '.tw5-node-red'
const packageDir = (fpath) => path.join(__dirname, fpath);

exports.config = {
	// Public and private proxies are used to create URLs
	//  to access wikis, and other tw5-node-red resources
	//  The public proxy can be seen by devices on you local network
	//  The private proxy is accessable by the machine running
	//   tw5-node-red application. ie: this machine only
	//
	// If issues arise using the publicName, replace 'os.hostname()'
	//  with IP address of this computer.
	//  ex: 'http://192.168.1.8' is IP address of this computer on my network
	//   yours will be different - finding it varies between OS's
	publicName: 'http://' + os.hostname(), // Local network computer name

	// The private proxy should always be 'http://localhost' or
	//  'http://127.0.0.1' - both are effectively the same
	privateName:'http://localhost', // this machine only

	// Wikis in 'wikisDir' folder that will be listed first
	//  as well as the wiki displayed if no wiki name is
	//  given in the browser URL address.
	//  if wiki does not exist in 'wikisDir' folder then the first wiki
	//  read from disk becomes the default wiki
	defaultWiki: 'Welcome',

	// Directory that contain all the 'server' edition
	//  wikis in the network
	wikisDir: packageDir('wikis'),

	// Location of 'server' edition database wikis that 
	//  can be used as TiddlyWiki databases where tiddlers
	//  are 'records' that are accessed using TW filters
	wikidbsDir: packageDir('dbs'),

	// Webservers are launched for each 'server' editon wiki in 'wikisDir:'
	// Access is performed thru the proxies (see 'proxy:' below)
	// Starting on port basePort and increments by one for each webserver
	webserver: {
		basePort: 9000,

		// WebServer parameters
		//  see 'https://tiddlywiki.com/static/WebServer%2520Parameters.html`
		// 'default' is applied to all webservers
		//  See 'credentials:' below for assigning Webserver credentials
		parameters: {
			default: ['debug-level=none']
		},
	},

	// The 'public' proxy can be accessed by devices on the local network
	// The 'private' proxy can only be accessed by localhost
	// Both proxies are identical except
	//   'public'  listens on host '0.0.0.0'   - access via machine hostname
	//   'private' listens on host '127.0.0.1' - access via 'localhost'
	proxy: { 
		// Default if a wiki is not listed  as 'public' or 'private'
		default: 'public',
		// The 'public' proxy allows network devices to access wikis
		public: {
			// public proxy port
			port: 3000,
			// wikis that are always public
			wikis: [ 'Home', 'Welcome' ],
		},

		// The 'private' proxy allows only localhost access to wikis
		private: {
			// private proxy port
			port: 4000,
			// wikis that are always private
			wikis: ['codebase'],
		},
	},

	// Node-Red settings
	//   Uses the default settings in Userdir settings.js file
	// Make changes in the Node-Red settings.js file as usual
	// The properties below will override settings in Node-Red settings.js
	nodered: {
		// Start up the Node-Red interface
		// If false Node-Red will not be started
		//   the wiki <<nodered 'topic' 'filter'>> macro 
		//   will perform no actions
		isEnabled: true,

		// Node-Red flowFile
		flowFile: packageDir('flows/tiddlywiki.json'),
		
		// Node-Red user directory
		//  which contains the node-red 'settings.js' file
		// '.node-red' is default for Node-Red
		userDir: path.join(os.homedir(), '.node-red'),

		// Allow 'global' variables to be displayed in flow editor
		//  the default is false - handy to see JavaScript functions
		//  and objects shared between tw5-node-red and Node-Red
		exportGlobalContextKeys: true,

		// URL path to Node-Red flow editor and http nodes
		httpAdminRoot: '/',
		httpNodeRoot:  '/api',

		// See https://github.com/node-red-contrib-themes/theme-collection
		// screenshots https://github.com/node-red-contrib-themes/theme-collection/blob/screenshots/README.md
		theme: {
			workspace: 'monokai-dimmed',
			editor: 'dracula'
		},

		// Override flow editor default host & port
		// uiHost: '0.0.0.0',
		// uiPort: 1880,
	},

	// TiddlyWiki Webserver user/password credentials
	// The system uses the Basic Authentication method
	// see https://tiddlywiki.com/static/WebServer%2520Basic%2520Authentication.html
	// packageDir('credentials') directory is ignored in .gitignore
	//  so will not be commited if using Git for version control
	// The 'security.js' file in the package directory contains the
	//  TiddlyWiki auth settings (which are OK to be commited)
	credentials: {
		// This file contains the User/Passwords
		userPasswordFile: packageDir('credentials/users.json'),

		// Directory of password CSV files used by webservers
		// Default is in the tw5-node-red user directory '~/.tw5-node-red'
		// see 'https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html'
		csvDir: packageDir('credentials/csv'),
	},

	// Your tw5-node-red NPM package
	pkg: require(packageDir('package.json')),
}
