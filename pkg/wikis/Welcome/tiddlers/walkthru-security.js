// TiddlyWiki Webserver user/password credentials
// The system uses the Basic Authentication method
// see https://tiddlywiki.com/static/WebServer%2520Basic%2520Authentication.html

// NOTE: To build credential files, start the server with
//   the '-c' option
// 'npm start -- -c'

module.exports = {
	// Demo users - obviously the passwords are exposed here
	//  are used for the initial install
	// If the 'userInfoFile' pointed to in 'config.js' does not
	//  exist, it will be created with these users/passwords
	//  otherwise these demo users are ignored
	demo: {
		"owner":  { "password": "pwned" },
		"demo":   { "password": "demo" },
		"poc2go": { "password": "ppp" },
				· · ·
	},

	// Default credentials
	// Users and webserver authorization parameters
	// see https://tiddlywiki.com/static/WebServer%2520Authorization.html
	default: {
		users: ['owner', 'poc2go', 'demo', 'jane', 'andy', 'roger', 'chuck'],
		authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=owner'],
	},

	// Webserver wikis not listed below will have the Default credentials above
	//  (entry will be ignored for any wikis that do not exist in 'wikisDir')
	wikis: {
		'Home': {
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=owner'],
		},
		'Swarms': {
			users: ['owner', 'poc2go', 'jane'],
			authorization: ['readers=(anon)', 'writers=(authenticated)', 'admin=owner'],
		},
				· · ·
	}
}
