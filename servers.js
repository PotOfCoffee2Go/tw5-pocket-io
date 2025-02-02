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

// REPL MOTD and prompt
function replMOTD() {
	hog(`\nGo to ${serverSettings[0].proxy.link}`,40);
	hog(`Press {up-arrow}{enter} for more info\n`,40);
	$rt.history.push(`cmd.run('help')`);
	$rt.history.push(`cmd.run('project REST -i')`);
	$rt.displayPrompt();
}

// Gets JavaScript code from wikis into REPL
const { replGetCodeFromWikis } = require('./lib/replGetCode');
function autoLoadCodeToRepl() {
	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	hog('\nREPL startup...', 156);
	hog(`Loading minified code tiddlers from wikis to REPL:`, 149);
	var { totalTiddlers, totalBytes, haveErrors } = replGetCodeFromWikis($rt, serverSettings);
	hog(`\n${totalTiddlers} tiddlers loaded - ${(totalBytes/1024).toFixed(3)}K bytes.`, 149);

	hog(`REPL startup complete${haveErrors ? ' - with errors.' : '.'}`, haveErrors ? 9 : 156);

	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);
}

// Proxy server to listen for connections
function proxyListen(idx) {
	return new Promise((resolve) => {
		const name = serverSettings[idx].name;
		const { server, port, host, targetUrl } = serverSettings[idx].proxy;
		server.http.listen(port, host, () => {
			log(`Proxy server to wiki '${name}' webserver ` + hue(targetUrl,156));
			hog(`  serving on http://${host === '0.0.0.0' ? config.proxy.domain : host}:${port}`,185);
			resolve();
		})
	})
}

// Start the proxy servers
async function startProxyServers() {
	hog(`\nStartup express http-proxy servers`, 156);
	hog(`  starting from port: ${config.proxy.basePort} :`, 156);
	for (let i=0; i<serverSettings.length; i++) {
		await proxyListen(i);
	}
	replMOTD();
}

// Startup blurb
hog(`${config.pkg.name} - v${config.pkg.version}`,40);
hog(`./config.js:`,40);
console.dir({wikisDir: config.wikisDir, webserver: config.webserver, proxy: config.proxy});
hog(`\nStartup TiddlyWiki 'server' edition Webservers`, 156);
hog(`  starting from port: ${config.webserver.basePort} :`, 156);
console.dir(serverSettings.map(settings => settings.name));

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
