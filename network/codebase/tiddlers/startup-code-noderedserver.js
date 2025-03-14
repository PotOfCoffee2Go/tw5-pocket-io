var $nodered = function () {
	var http = require('http');
	var express = require("express");
	this.RED = require("node-red");

	// Create an Express app
	this.app = express();

	// Add a simple route for static content served from 'public'
	this.app.use("/",express.static("public"));

	// Create a server
	this.server = http.createServer(this.app);

	// Create the settings object - see default settings.js file for other options
	this.settings = require('/home/poc2gopi/.node-red/settings.js');
	this.settings = Object.assign({}, this.settings, {
		httpAdminRoot:"/red",
		httpNodeRoot: "/api",
		userDir:'/home/poc2gopi/.node-red',
		functionGlobalContext: {
			$nrInMsg,
			$nrOutMsg,
			get$twCodebase,
			get$wikiNames,
			get$settings,
			get$tw,
			get$proxy,
			get$server,
			get$router,
			get$pocketio,
		}    // enables global context
	});

	// Initialise the runtime with a server and settings
	this.RED.init(this.server, this.settings);

	// Serve the editor UI from /red
	this.app.use(this.settings.httpAdminRoot,this.RED.httpAdmin);

	// Serve the http nodes UI from /api
	this.app.use(this.settings.httpNodeRoot,this.RED.httpNode);

	this.server.listen(1880);

	// Start the runtime
	this.RED.start();

	return this;
};

setTimeout(() => { global.$nr = new $nodered; }, 3000);
