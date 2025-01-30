// Start up the webservers, load code
//  into REPL, and startup proxies

"use strict";

const { config } = require('./config');

// Helpers
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

// Build settings
const { buildSettings } = require('./lib/buildSettings');
const serverSettings = buildSettings(config);

// Create Proxy servers
const { ProxyServer } = require('./lib/twProxyServer');
serverSettings.forEach((settings, idx) => {
	serverSettings[idx].proxy.server = new ProxyServer(settings);
})

// REPL
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true});
var $rw, $sockets = {};

// REPL context
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
	loadCodeToRepl();
})
// REPL MOTD and prompt
function replMOTD() {
	hog(`\nGo to ${serverSettings[0].proxy.link}`,40);
	hog(`Press {up-arrow}{enter} for more info\n`,40);
	$rt.history.push(`cmd.run('help')`);
	$rt.history.push(`cmd.run('project REST -i')`);
	$rt.displayPrompt();
}

// Pull JavaScript code from code wiki into REPL
const { replGetCode } = require('./lib/replGetCode');

function loadAllCodeToRepl() {
	hog('\nREPL startup...', 156);

	var codeList = [];
	// codebase 'startup project' loads first
	codeList.push({wikiName: 'codebase',
		$tw: serverSettings.find(settings => settings.name === 'codebase').$tw,
		filter: '[tag[$:/pocket-io/startup/code]]'})

	var	findProjects = '[tag[Projects]]';
	serverSettings.forEach(settings => {
		var $tw = settings.$tw;
		$tw.wiki.filterTiddlers(findProjects).forEach(projectTitle => {
			if (projectTitle !== 'startup') {
				var projectTid = $tw.wiki.getTiddler(projectTitle);
				if (projectTid && projectTid.fields && projectTid.fields.autoLoad === 'yes') {
					codeList.push({wikiName: settings.name, $tw: $tw, filter: `[tag[$:/pocket-io/${projectTitle}/code]]`});
				}
			}
		})
	})
	var totalTiddlers = 0, totalBytes = 0;
	hog(`Loading minified code tiddlers from wikis to REPL:`, 149);
	codeList.forEach(codeFilter => {
		var { tiddlerCount, byteCount } = replGetCode($rt, codeFilter.wikiName, codeFilter.$tw, codeFilter.filter);
		totalTiddlers += tiddlerCount;
		totalBytes += byteCount;
	})
	hog(`\n${totalTiddlers} tiddlers loaded - ${(totalBytes/1024).toFixed(3)}K bytes.`, 149);
	hog(`REPL startup complete`, 156);
}

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
//  Once REPL booted, load the code tiddlers from codebase wiki
//  then fire up the proxy servers
var nestWebservers = '';
var closingNest = `
replTwBoot().then(tw => {
$rw = tw;
replContext();
loadAllCodeToRepl();
startProxyServers();
})
`;

// Create code to startup everything
for (let i=0; i<serverSettings.length; i++) {
	nestWebservers += `
twServerBoot(serverSettings[${i}])
.then((tw) => {serverSettings[${i}].$tw = tw;`
	closingNest += '})';
}

const { twServerBoot } = require('./lib/twServerBoot');
const { replTwBoot } = require('./lib/replTwBoot');

// Run code
eval(nestWebservers + closingNest);

// footnote: a good writeup on REPL development
// https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/

