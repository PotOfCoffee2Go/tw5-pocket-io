// Start up the webservers, load code
//  into REPL, and startup proxies

"use strict";

// Start of config

// wikisDir - directory containing 'server' edition wikis
//   All wikis in that diectory will be served starting on
//   port basePort and increments by one for each wiki
// 'server' edition host and starting port
// express proxy host and starting port
const config = {
	wikisDir: './wikis',
	webserver: { host: '127.0.0.1', basePort: 8082 },
	proxy: { host: '0.0.0.0', basePort: 3002 },
	pkg: require('./package.json')
}

// End of config

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
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true, tabSize: 2 });
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
	hog(`\nPress {up-arrow}{enter} for more info\n`,40);
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
		filter: '[tag[$:/pocket-io/code/startup]]'})

	var	findProjects = '[tag[Projects]]';
	serverSettings.forEach(settings => {
		var $tw = settings.$tw;
		$tw.wiki.filterTiddlers(findProjects).forEach(title => {
			if (title !== 'startup') {
				var projectTid = $tw.wiki.getTiddler(title);
				if (projectTid && projectTid.fields && projectTid.fields.autoLoad === 'yes') {
					codeList.push({wikiName: settings.name, $tw: $tw, filter: `[tag[$:/pocket-io/code/${title}]]`});
					codeList.push({wikiName: settings.name, $tw: $tw, filter: `[tag[$:/pocket-io/${title}/code]]`});
				}
			}
		})
	})
//	console.dir(codeList, {depth:1});
	hog(`Loading minified code tiddlers from wikis to REPL:`, 149);
	codeList.forEach(codeFilter => {
		replGetCode($rt, codeFilter.wikiName, codeFilter.$tw, codeFilter.filter);

	})

}

function proxyListen(idx) {
	return new Promise((resolve) => {
		const name = serverSettings[idx].name;
		const { server, port, host, targetUrl } = serverSettings[idx].proxy;
		server.http.listen(port, host, () => {
			log(`Proxy server to wiki '${name}' webserver ` + hue(targetUrl,156));
			hog(`  serving on http://${host}:${port}`,185);
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

