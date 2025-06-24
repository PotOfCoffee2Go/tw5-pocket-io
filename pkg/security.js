// TiddlyWiki Webserver user/password credentials
// The system uses the Basic Authentication method
// see https://tiddlywiki.com/static/WebServer%2520Basic%2520Authentication.html

// NOTE: To rebuild credential files, start the server
//  with the '-c' option
// 'npm start -- -c'

module.exports = {
	// Demo users - obviously the passwords are exposed here
	//  are used for the initial install
	// If the 'userPasswordFile' pointed to in 'config.js' does not
	//  exist, it will be created with these users/passwords
	//  otherwise these demo users are ignored
	demo: {
		"owner":  { "password": "pwned" },
		"poc2go": { "password": "ppp" },
		"jane":   { "password": "do3" },
		"roger":  { "password": "m00re" },
		"chuck":  { "password": "n0rri5" },
	},

	// Default credentials
	// Users and webserver authorization parameters
	// see https://tiddlywiki.com/static/WebServer%2520Authorization.html
	// New wikis not listed below will automatically have the default credentials
	default: {
		users: ['owner', 'poc2go', 'jane', 'roger', 'chuck'],
		authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=owner'],
	},

	// Override default
	// Entry will be ignored for wikis that do not exist
	wikis: {
		'Home': {
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=owner'],
		},
		'Swarms': {
			users: ['owner', 'poc2go', 'jane'],
			authorization: ['readers=(anon)', 'writers=(authenticated)', 'admin=owner'],
		},
		'Welcome': {
			users: ['owner', 'poc2go', 'chuck'],
			authorization: ['readers=(anon)', 'writers=(authenticated)', 'admin=owner'],
		},
		'rpi-zero': {
			users: ['owner', 'poc2go'],
			authorization: ['readers=(anon)', 'writers=(authenticated)', 'admin=owner'],
		},
		'codebase': {
			users: ['owner', 'poc2go'],
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=owner'],
		},
	}
}
