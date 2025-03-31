// Start up the webservers, load code
//  into REPL, and startup proxies

"use strict";
const os = require('node:os');

// Helpers
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const cpy = (obj) => JSON.parse(JSON.stringify(obj));

// Build settings
const { config } = require('./config');
const { dataTwBoot } = require('./lib/dataTwBoot');
const { replTwBoot } = require('./lib/replTwBoot');
const { twServerBoot } = require('./lib/twServerBoot');
const { ProxyServer } = require('./lib/twProxyServer');
const { buildSettings } = require('./lib/buildSettings');

// Build settings based on config
const serverSettings = buildSettings(config);

// Create Proxy server instances
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
	$rt.context.$db = $db;	// tiddlywiki instance for REPL use
	$rt.context.$config = config;
	$rt.context.$ss = serverSettings;

	// Application objects
	$rt.context.$sockets = $sockets; // clients connected to server
	$rt.context.$tpi = { fn: { io:{} }, topic: {}, repl: {} }; // tw5-pocket-io code
	$rt.context.$tmp = {}; // object for temporary use

	$rt.setPrompt(hue(os.hostname + ' ' + config.pkg.name + ' > ',214));
}
$rt.on('reset', () => {
	replContext();
	autoLoadCodeToRepl();
})

// Show a few stats about database wikis
function displayDatabaseStats() {
	var stats = [];
	var padName = 0, padCount = 0;
	for (let name in $db) {
		padName = padName < name.length ? name.length : padName;
		var count = $db[name].$tw.wiki.filterTiddlers('[!is[system]count[]]').toString();
		padCount = padCount < count.length ? count.length : padCount;
		stats.push({ name: name.padEnd(padName+1, ' '), count: count.padStart(padCount,' ')});
	}
	stats.forEach(stat => {
		hog(` ${stat.name}: ${stat.count} standard records/tiddlers`, 216);
	})
	return $db;
}

// Gets JavaScript code from wikis into REPL
const { replGetCodeFromWikis } = require('./lib/replGetCode');
function autoLoadCodeToRepl() {
	hog('Webserver startup complete\n', 156);

	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	hog('REPL context startup', 156);
	hog(`Loading minified code tiddlers from wikis to REPL:`, 156);
	var { totalTiddlers, totalBytes, haveErrors } = replGetCodeFromWikis($rt, serverSettings);
	hog(`Total of ${totalTiddlers} code tiddlers loaded - ${(totalBytes/1024).toFixed(3)}K bytes.`, 43);
	hog(`Loading server code complete${haveErrors ? ' - with errors' : ''}`, haveErrors ? 9 : 156)
	hog(`REPL context startup complete\n`, 156);

	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);
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

// Proxy server listen for connections
function proxyListen(idx) {
	return new Promise((resolve) => {
		const name = serverSettings[idx].name;
		const { server, domain, port, host, targetUrl } = serverSettings[idx].proxy;
		server.http.listen(port, host, () => {
			log(hue(` Proxy to webserver `,185) + `'${name}'` +
				hue(` serving on `,185) + `http://${domain}:${port}`);
			resolve();
		})
	})
}

// REPL MOTD and prompt
function replMOTD() {
	hog(`Press {enter} at any time to display the prompt`,40);
	hog(`'${config.defaultWiki}' wiki is at ${serverSettings[0].proxy.link}`,40);
	if (config.autoStartNodeRed) {
		hog(`\nStartup Node-RED`, 156);
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
	wikidbsDir: config.wikidbsDir,
	wikisDir: config.wikisDir,
	webserver: config.webserver,
	proxy: config.proxy,
	hideCodebase: config.hideCodebase
});

hog(`\nTW5-Node-Red host is '${config.domain}'`, 156);
hog(`Database wikis from directory ${config.wikidbsDir}`, 156);
hog(`Webservers from directory ${config.wikisDir}`, 156);
hog(`'codebase' wiki from directory ./network\n`, 156);

hog(`Startup database wikis`, 156);
const $db = dataTwBoot(config.wikidbsDir);
displayDatabaseStats();
hog(`Database wikis startup complete\n`, 156);

// Start up the TiddlyWiki Webservers and boot the REPL
//  Once REPL $tw booted, load the code tiddlers from the wikis
//  then fire up the proxy servers
hog(`Webserver wikis starting at port: ${config.webserver.basePort}`, 156);
hog(' ' + serverSettings.map(settings => settings.name).join(' ') + '\n', 40);

// Create code to startup everything in REPL context
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
