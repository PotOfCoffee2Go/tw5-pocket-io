// TiddlyWiki Webserver user/password credentials
// The system uses the Basic Authentication method
// see https://tiddlywiki.com/static/WebServer%2520Basic%2520Authentication.html

module.exports = {
	// Demo users - obviously the passwords are exposed here
	// If the 'userInfoFile' pointed to in 'config.js' does not
	//  exist, it will be created with these users/passwords
	//  otherwise these demo users are ignored
	demo: {
		"demo":   { "password": "demo" },
		"poc2go": { "password": "ppp" },
		"jane":   { "password": "do3" },
		"andy":   { "password": "smith" },
		"roger":  { "password": "m00re" }
	},

	// Default credentials
	// Users and webserver authorization parameters
	// see https://tiddlywiki.com/static/WebServer%2520Authorization.html
	default: {
		users: ['demo', 'poc2go', 'jane', 'andy', 'roger'],
		authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
	},

	// Webserver wikis not listed below will run WITHOUT credentials
	//  (entry will be ignored for any wikis that do not exist) in 'wikisDir'
	wikis: {
		'Home': {}, // Apply default credentials
		'notes': {},
		'codebase': {
			users: ['demo', 'poc2go'],
			authorization: ['readers=(authenticated)', 'writers=(authenticated)', 'admin=poc2go'],
		},
		'poc2go': {
			users: ['demo', 'poc2go'],
		}
	}
}
