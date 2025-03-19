const $nrMsgNodes = [];
const $NodeRed = function () {
	var express = require("express");
	this.RED = require("node-red");

	this.app = express();
	this.server = http.createServer(this.app);

	// Node-Red settings
	this.nodered = Object.assign({}, $config.nodered);
	// Using the Node-Red settings file specified in ./config.js
	this.settings = require(this.nodered.settingsFile);
	delete this.nodered.settingsFile; // no longer needed

	// Our functions to Node-Red global context
	var globalFunctions = {
		$rt, $rw, $nrMsgNodes, $nrInMsg,
		$sockets, $refreshClients,	
		get$tw, get$twCodebase,
		get$settings, get$wikiNames,
		get$proxy, get$server,
		get$router, get$pocketio,
	}
	this.nodered.functionGlobalContext = Object.assign(
		{},	this.nodered.functionGlobalContext, globalFunctions
	)
	// Merge Node-Red settings
	this.settings = Object.assign({}, this.settings, this.nodered)

	// Initialise the Node-Red runtime to this server
	// Serve the Node-Red editor UI
	// Serve the Node-Red http nodes
	// Serve static content from our 'public' directory
	this.RED.init(this.server, this.settings);
	this.app.use(this.settings.httpAdminRoot,this.RED.httpAdmin);
	this.app.use(this.settings.httpNodeRoot,this.RED.httpNode);
	this.app.use('/', express.static('public'));

	// Start server and Node-Red runtime
	this.server.listen(this.settings.uiPort || 1880);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');
	log('\x1b[38;5;149m');
	this.RED.start()
		.then(() => { // wait for it - adjust timer as needed
			setTimeout(() => {
				log('\x1b[0m');
				$rt.setPrompt(prevPrompt);
				}, 1000)
		})
	return this;
};
