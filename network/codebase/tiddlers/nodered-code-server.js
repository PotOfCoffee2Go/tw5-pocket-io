// List of each 'wiki in' node in workspace
//  used to pass wiki messages to Node-Red
const $nrMsgNodes = [];

const $NodeRed = function () {
	var express = require("express");
	this.RED = require("node-red");

	this.app = express();
	this.server = http.createServer(this.app);

	// Node-Red settings
	this.nodered = Object.assign({}, $config.nodered);
	// Using the Node-Red settings file specified in ./config.js
	this.settings = require(this.nodered.userDir + '/settings.js');

	this.nodered.link = {
		admin: `http://${$config.domain}:${this.settings.uiPort || 1880}` +
		`${this.nodered.httpAdminRoot}`,
		node: `http://${$config.domain}:${this.settings.uiPort || 1880}` +
		`${this.nodered.httpNodeRoot}`
	}

	// functions to Node-Red global context
	//  see codebase [[startup-code-globals]]
	this.repl = {
		$displayPrompt, $rw, $db,
		$config,  $ss, $sockets, $tpi,
		$wikiNames, get$settings,
		$twCodebase,
		get$db, qry$db, ins$db,
		get$tw, qry$tw, ins$tw,
		get$proxy, get$server, get$router, get$pocketio,
		$refreshClients, $broadcastClients,
		$nrParser
	}
	var globalFunctions = { $nrMsgNodes, repl: this.repl };
	this.nodered.functionGlobalContext = Object.assign(
		{},	this.nodered.functionGlobalContext, globalFunctions
	)

	// Merge Node-Red settings
	this.settings = Object.assign({}, this.settings, this.nodered)

	// Personalize Flow editor settings for TW5-Node-Red
	this.settings.editorTheme.header = {
		title: `TW5-Node-Red Host: <b>${$config.domain}</b> Package: <b>${$config.packageName}</b>`,
 		image: path.resolve('./public/images/system/tw5-node-red-logo.png'),
	};
	this.settings.editorTheme.page = {
		title: 'TW5-Node-Red',
		css: path.resolve('./public/node-red-editor.css'),
	};
	this.settings.editorTheme.login = {
		image: path.resolve('./public/images/system/tw5-node-red-login.png')
	};

	// Initialise the Node-Red runtime to this server
	// Serve the Node-Red editor UI
	// Serve the Node-Red http nodes
	// Serve static content from our 'public' directory
	this.RED.init(this.server, this.settings);
	this.app.use(this.settings.httpAdminRoot,this.RED.httpAdmin);
	this.app.use(this.settings.httpNodeRoot,this.RED.httpNode);
	this.app.use('/', express.static('public'));

	// Overload Node-Red logger to display with color
	//  during the Node-Red startup
	this.RED.log.info = (t) => log(hue(t, 111));
	this.RED.log.warn = (t) => log(hue(t, 129));
	// Errors always red with date/time
	this.RED.log.error = (t) => tog(t, 9);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	// Start server and Node-Red runtime
	this.server.listen(this.settings.uiPort || 1880);
	this.RED.start()
		.then(() => { // wait for it
			setTimeout(() => {
				// End the startup and log info/warning with color
				//  and date/time from now on
				hog(`\n===================\n`, 111);
				hog(`Node-Red startup complete\n`, 156);
				this.RED.log.info = (t) => tog(t, 111);
				this.RED.log.warn = (t) => tog(t, 129);
				$rt.setPrompt(prevPrompt);
				this.isRunning = true;
				}, 1000) // adjust timer as needed
		})

	return this;
};
