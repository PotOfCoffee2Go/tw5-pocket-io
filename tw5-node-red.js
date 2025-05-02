// Start up the webservers, load code
//  into REPL, and startup proxies

"use strict";
const os = require('node:os');

// Helpers
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const col = (nbr=40) => `\x1b[${nbr}G`;

const { config } = require('./lib/buildPackage')();
const { wikiSettings } = require('./lib/wikiSettings');
const { PocketIoServer } = require('./lib/pocketIoServer');
const { replTwBoot } = require('./lib/replTwBoot');
const { twServerBoot } = require('./lib/twServerBoot');
const { replGetCodeFromWikis } = require('./lib/replGetCode');
const { dataTwBoot, databaseStats } = require('./lib/twDbsBoot');

hog(`${config.pkg.name} - v${config.pkg.version}\n`,40);

// ---- Config ----
// Build WebServer config
const serverSettings = wikiSettings(config);

// Create proxies
const publicServer = new PocketIoServer(config, serverSettings, true);
const privateServer = new PocketIoServer(config, serverSettings, false);

// Add proxy settings to config
serverSettings.forEach((settings, idx) => {
	serverSettings[idx].proxy.server = publicServer.addTarget(config, settings);
	serverSettings[idx].proxy.server = privateServer.addTarget(config, settings);
	if (!serverSettings[idx].proxy.server) {
		hog(`Unable to assign proxy for WebServer '${serverSettings[idx].name}'`, 9); 
		process.exit(10);
	}
})

// ---- REPL ----
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true});

// context
var $rw, $sockets = {};
function replContext() {
	$rt.context.$rt = $rt;	// the REPL itself
	$rt.context.$rw = $rw;	// tiddlywiki instance for REPL use
	$rt.context.$db = $db;	// tiddlywiki instance for REPL use
	$rt.context.$config = config;
	$rt.context.$ss = serverSettings;

	// Application objects
	$rt.context.$sockets = $sockets; // clients connected to server
	$rt.context.$tpi = { fn: { io:{} }, topic: {}, repl: {} }; // tw5-pocket-io code

	$rt.setPrompt(hue(os.hostname + ' ' + config.packageName + ' > ',214));
}
$rt.on('reset', () => {
	replContext();
	autoLoadCodeToRepl();
})

// ---- Server code ----
function autoLoadCodeToRepl() {
	hog('Webserver startup complete\n', 156);

	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	hog('REPL context startup', 156);
	hog(`Loading minified pocket-io code tiddlers from wikis to REPL:`, 156);
	var { totalTiddlers, totalBytes, haveErrors } = replGetCodeFromWikis($rt, serverSettings);
	hog(`Total of ${totalTiddlers} code tiddlers loaded - ${(totalBytes/1024).toFixed(3)}K bytes.`, 43);
	hog(`Loading server code complete${haveErrors ? ' - with errors' : ''}`, haveErrors ? 9 : 156)
	hog(`REPL context startup complete\n`, 156);

	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);
}

// Poxy servers startup
async function startProxyServer() {
	hog(`Startup proxies to webservers`, 156);
	hog(` Public proxy '${publicServer.domain}:${publicServer.port}' listening for requests:`,185);
	await publicServer.proxyListen(serverSettings, $rt.context.$tpi);
	hog(` Private proxy '${privateServer.domain}:${privateServer.port}' listening for requests:`,185);
	await privateServer.proxyListen(serverSettings, $rt.context.$tpi);
	hog(`Proxy startup complete\n`, 156);
	replMOTD();
}


// REPL MOTD and prompt startup
function replMOTD() {
	hog(`Press {enter} at any time to display the prompt`,40);
	hog(`'${config.defaultWiki}' wiki is at ${serverSettings[0].proxy.link}`,40);
	if (config.autoStartNodeRed) {
		hog(`\nStartup Node-RED with access to wikis`, 156);
		const { hideStdout } = require('./lib/hideStdout');
		const showStdout = hideStdout();
		$rt.write('const $nr = new $NodeRed\n');
		showStdout();
	}
	else {
		hog(`Press {up-arrow}{enter} to start Node-Red`,40);
		$rt.history.push(`const $nr = new $NodeRed`);
	}
	$rt.displayPrompt();
}

// ---- Startup ----
//Startup blurb
hog(`Configuration summary`, 156);
hog(` package ${col(13)}: ${config.pkg.name}\n` +
	` domain ${col(13)}: ${config.domain}\n` +
	` packageDir ${col(13)}: ${config.packageDir}\n` +
	` wikidbsDir ${col(13)}: ${config.wikidbsDir}\n` +
	` wikisDir ${col(13)}: ${config.wikisDir}\n` +
	` flowFile ${col(13)}: ${config.nodered.flowFile}\n`, 40);

hog(`Startup database wikis`, 156);
const $db = dataTwBoot(config.wikidbsDir);
databaseStats($db);
hog(`Database wikis startup complete\n`, 156);

// Start up the TiddlyWiki Webservers and boot the REPL
//  Once REPL $tw booted, load the code tiddlers from the wikis
//  then fire up the proxy servers
hog(`Webserver wikis starting on port: ${config.webserver.basePort}`, 156);
//hog(' ' + serverSettings.map(settings => settings.name).join(' ') + '\n', 40);

// Create code to startup everything in REPL context
var nestWebservers = '';
var closeNest = `
replTwBoot().then(tw => {
$rw = tw;
replContext();
autoLoadCodeToRepl();
startProxyServer();
})
`;

// Since can have any number of webservers
//  need to construct code to start them all
//    each webserver runs in the context of the previous one
//    thus do not need spawn child processes to run WebServers
// Generate code to startup the system
for (let i=0; i<serverSettings.length; i++) {
	nestWebservers += `
		twServerBoot(serverSettings[${i}])
		.then((tw) => {serverSettings[${i}].$tw = tw;`
	closeNest += '})';
}

// Run system startup code
eval(nestWebservers + closeNest);

// footnote: a good writeup on REPL development
// https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
