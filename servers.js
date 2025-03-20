// Start up the webservers, load code
//  into REPL, and startup proxies

"use strict";

// Helpers
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const cpy = (obj) => JSON.parse(JSON.stringify(obj));

// Build settings
const { config } = require('./config');
const { buildSettings } = require('./lib/buildSettings');
const serverSettings = buildSettings(config);

// Create Proxy servers
const { ProxyServer } = require('./lib/twProxyServer');
serverSettings.forEach((settings, idx) => {
	serverSettings[idx].proxy.server = new ProxyServer(settings);
})

// REPL instance
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true});

// REPL context
var $rw, $sockets = {};
function replContext() {
	$rt.context.$rt = $rt;	// the REPL itself
	$rt.context.$rw = $rw;	// tiddlywiki instance for REPL use
	$rt.context.$config = config;
	$rt.context.$ss = serverSettings;

	// Application objects
	$rt.context.$sockets = $sockets; // clients connected to server
	$rt.context.$tpi = { fn: { io:{} }, topic: {}, repl: {} }; // tw5-pocket-io code
	$rt.context.$tmp = {}; // object for temporary use

	$rt.setPrompt(hue(config.pkg.name + ' > ',214));
}
$rt.on('reset', () => {
	replContext();
	autoLoadCodeToRepl();
})

// Gets JavaScript code from wikis into REPL
const { replGetCodeFromWikis } = require('./lib/replGetCode');
function autoLoadCodeToRepl() {
	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	hog('Webserver startup complete\n\nREPL startup...', 156);
	hog(`Loading minified code tiddlers from wikis to REPL:`, 156);
	var { totalTiddlers, totalBytes, haveErrors } = replGetCodeFromWikis($rt, serverSettings);
	hog(`\nTotal of ${totalTiddlers} code tiddlers loaded - ${(totalBytes/1024).toFixed(3)}K bytes.`, 129);
	hog(`\nLoading server code complete${haveErrors ? ' - with errors.' : '.'}`, haveErrors ? 9 : 156)
	hog(`REPL startup complete\n`, 156);

	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);
}

// Proxy server to listen for connections
function proxyListen(idx) {
	return new Promise((resolve) => {
		const name = serverSettings[idx].name;
		const { server, domain, port, host, targetUrl } = serverSettings[idx].proxy;
		server.http.listen(port, host, () => {
			log(hue(`Proxy to webserver `,185) + `'${name}'` +
				hue(` serving on `,185) + `http://${domain}:${port}`);
			resolve();
		})
	})
}

// Start the proxy servers
async function startProxyServers() {
	hog(`Startup express proxies to webservers\nProxies starting at port: ${config.proxy.basePort}`, 156);
	for (let i=0; i<serverSettings.length; i++) {
		await proxyListen(i);
	}
	hog(`Proxy startup complete\n`, 156);
	replMOTD();
}

// REPL MOTD and prompt
function replMOTD() {
	hog(`Press {enter} at any time to display the prompt`,40);
	hog(`'${config.defaultWiki}' wiki is at ${serverSettings[0].proxy.link}`,40);
	if (config.autoStartNodeRed) {
		const { hideStdout } = require('./lib/hideStdout');
		const showStdout = hideStdout();
		$rt._ttyWrite('const $nr = new $NodeRed\n');
		showStdout();
	}
	else {
		hog(`Press {up-arrow}{enter} to start Node-Red`,40);
		$rt.history.push(`const $nr = new $NodeRed`);
	}
	$rt.displayPrompt();
}

// -------------------

// Startup blurb
hog(`${config.pkg.name} - v${config.pkg.version}`,40);
hog(`Settings summary from ./config.js:`,40);
console.dir({
	wikisDir: config.wikisDir,
	webserver: config.webserver,
	proxy: config.proxy,
	forceCodebaseLocal: config.forceCodebaseLocal
});
hog(`\nStartup ${serverSettings.length} TiddlyWiki 'server' edition Webservers from directory ${config.wikisDir}`, 156);
hog(`  including pocket-io wiki 'codebase' from directory ./network/codebase\n`, 156);
hog(`Webserver wikis starting at port: ${config.webserver.basePort} :`, 156);
console.dir(serverSettings.map(settings => settings.name).join(' '));
hog('');

// Start up the TiddlyWiki Webservers and boot the REPL
//  Once REPL $tw booted, load the code tiddlers from the wikis
//  then fire up the proxy servers
const { replTwBoot } = require('./lib/replTwBoot');
const { twServerBoot } = require('./lib/twServerBoot');

// Create code to startup everything
var nestWebservers = '';
var closeNest = `
replTwBoot().then(tw => {
$rw = tw;
replContext();
autoLoadCodeToRepl();
startProxyServers();
})
`;

// Since can have any number of webservers
//  (each webserver runs in the context of the previous one
//    thus do not need spawn child processes to run the servers)
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
