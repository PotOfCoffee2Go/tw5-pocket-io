const $NodeRed = function () {
	var express = require("express");
	this.RED = require("node-red");

	this.app = express();
	this.server = http.createServer(this.app);

	// Node-Red settings
	//  Override settings required of this Node-Red server
	// To use your current Node-Red credentials
	//		userDir:`${homedir}/.node-red`,

	// Our Node-Red settings from ./config.js
	this.nodered = Object.assign({},$config.nodered);
	// Using the Node-Red settings file from ,/config.js
	this.settings = require(this.nodered.settingsFile);
	delete this.nodered.settingsFile; // no longer needed

	// Merge our functions to Node-Red global context
	var globalFunctions = {
		$sockets, $refreshClients, $nrInMsg,	
		get$tw, get$twCodebase,
		get$settings, get$wikiNames,
		get$proxy, get$server,
		get$router, get$pocketio,
	}
	this.nodered.functionGlobalContext = Object.assign({},
		this.nodered.functionGlobalContext, globalFunctions)

	// Node-Red settings required for this server
	this.settings = Object.assign({}, this.settings, this.nodered)

	// Initialise the Node-Red runtime to this server
	// Serve the Node-Red editor UI  (admin) from '/red'
	// Serve the Node-Red http nodes from '/api'
	// Serve static content from our public directory
	this.RED.init(this.server, this.settings);
	this.app.use(this.settings.httpAdminRoot,this.RED.httpAdmin);
	this.app.use(this.settings.httpNodeRoot,this.RED.httpNode);
	this.app.use('/', express.static('public'));

	// Start server and Node-Red runtime
	this.server.listen(1880);
	this.RED.start();

	return this;
};

// Startup Node-Red
//setTimeout(() => { global.$nr = new $NodeRed; }, 3000);
