module.exports = {
	// Demo users - obviously the passwords are exposed here
	// If the 'userInfoFile' above does not exist, it will
	//  be created with these users/passwords
	//  otherwise these demo users are ignored
	//   as can change them in the 'userInfoFile'
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
		'notes': {}, // Apply default credentials
		'MyWiki':{},
		'twtalk':{},
		'Home': {
			authorization: ['anon-username=demo', 'readers=(anon)', 'writers=(authenticated)', 'admin=poc2go'],
		},
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
