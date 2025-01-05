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
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true });
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

function loadCodeToRepl() {
	hog('\nREPL startup...', 156);
	// 'startup project' loads first
	var projectFilter = '[tag[$:/pocket-io/code/startup]]';

	// The rest of the projects with 'autoLoad field === 'yes'
	var	filter = '[tag[Projects]]';
	const $tw = serverSettings.find(settings => settings.name === 'codebase').$tw;
	$tw.wiki.filterTiddlers(filter).forEach(title => {
		if (title !== 'startup') {
			var projectTid = $tw.wiki.getTiddler(title);
			if (projectTid && projectTid.fields && projectTid.fields.autoLoad === 'yes') {
				projectFilter += `[tag[$:/pocket-io/code/${title}]]`;
			}
		}
	})

	// Load the code tiddlers from code wiki into REPL
	var hadErrors = replGetCode($rt, $tw, projectFilter);
	hog(`REPL tw instance $rw - startup complete ${hadErrors ? hue(' - with an error in a code tiddler', 163) : ''}`, 156);
}

function proxyListen(idx) {
	return new Promise((resolve) => {
		const name = serverSettings[idx].name
		const { server, port, host, targetUrl } = serverSettings[idx].proxy;
		server.http.listen(port, host, () => {
			log(`Proxy server to wiki '${name}' webserver ` + hue(targetUrl,156));
			hog(`  proxy serving on http://${host}:${port}`,185);
			resolve();
		})
	})
}

// Start the proxy servers
async function startProxyServers() {
	log('');
	for (let i=0; i<serverSettings.length; i++) {
		await proxyListen(i);
	}
	replMOTD();
}

// Startup TiddlyWiki Webservers
hog(`${config.pkg.name} - v${config.pkg.version}`,40);
hog(`\nStartup TiddlyWiki 'server' edition Webservers:\n`, 156);
console.dir(serverSettings.map(settings => settings.name));
hog('');

const { twServerBoot } = require('./lib/twServerBoot');
const { replTwBoot } = require('./lib/replTwBoot');

// Create tiddlywiki instances
//  start up the TiddlyWiki Webservers and boot the REPL
//  Once REPL booted load the code tiddlers from $code wiki
//  then fire up the proxy serve rs
var nestWebservers = '';
var closingNest = `
replTwBoot().then(tw => {
$rw = tw;
replContext();
loadCodeToRepl();
startProxyServers();
})
`;
for (let i=0; i<serverSettings.length; i++) {
	nestWebservers += `
twServerBoot(serverSettings[${i}])
.then((tw) => {serverSettings[${i}].$tw = tw;`
	closingNest += '})';
}

//console.log(nestWebservers + closingNest);
eval(nestWebservers + closingNest);

// footnote: a good writeup on REPL development
// https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/

