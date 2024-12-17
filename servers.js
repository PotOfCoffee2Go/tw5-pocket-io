// Start up the webservers, load code
//  into REPL, and startup proxies

"use strict";

// Start of config

// dashboard and code webservers available to browsers on network
const dashboardWebserver = true;
const codebaseWebserver = true;
// data webserver is always available to browsers

// Server edition TiddlyWikis Webservers
// host='127.0.0.1' local system
// local access only - (proxies have access)
const wikihost='127.0.0.1',
	dashWikiDir = 'wikis/dashbase', dashPort = 8082,
	codeWikiDir = 'wikis/codebase', codePort = 8083,
	dataWikiDir = 'wikis/database', dataPort = 8084;

// Target computer running 'server' edition webservers
//  - needs to be '127.0.0.1' ip address - not 'localhost'
//  - why? the proxy servers do not always have DNS lookup available
const proxyTargetIp ='http://127.0.0.1';

// Reverse proxy to server editon webservers above
const proxyhost='0.0.0.0', // proxies accessable from network
	dashProxyPort = 3000, codeProxyPort = 3001, dataProxyPort = 3002;

// end of config

// Helpers
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const wrt = (txt) => $rt.write(txt + '\n');

// REPL
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true });

// Proxy servers
const { ProxyServer } = require('./lib/twProxyServer');
var $dash = new ProxyServer(`${proxyTargetIp}:${dashPort}`);
var $code = new ProxyServer(`${proxyTargetIp}:${codePort}`);
var $data = new ProxyServer(`${proxyTargetIp}:${dataPort}`);

// Startup TiddlyWiki Webservers
hog(`Startup TiddlyWiki 'server' edition Webservers:`, 156);
const { twServerBoot } = require('./lib/twServerBoot');
const { replTwBoot } = require('./lib/replTwBoot');

// Create tiddlywiki instances
//  start up the TiddlyWiki Webservers and boot the REPL
//  Once REPL booted load the code tiddlers from $code wiki
//  then fire up the proxy serve rs
var $ds, $dw, $cw, $rw, $sockets = {};
twServerBoot('$ds', dashWikiDir, wikihost, dashPort, dashboardWebserver).then(tw => {
	$ds = tw;
	twServerBoot('$cw', codeWikiDir, wikihost, codePort, codebaseWebserver).then(tw => {
		$cw = tw;
		twServerBoot('$dw', dataWikiDir, wikihost, dataPort, true).then(tw => {
			$dw = tw;
			replTwBoot().then(tw => {
				$rw = tw;
				replContext();
				loadCodeToRepl();
				startProxyServers();
			})
		})
	})
})

// REPL context
function replContext() {
	$rt.context.$rt = $rt;	// the REPL itself
	$rt.context.$rw = $rw;	// tiddlywiki instance for REPL use
	$rt.context.$ds = $ds;	// Dash tiddlywiki instance
	$rt.context.$cw = $cw;	// Code tiddlywiki instance
	$rt.context.$dw = $dw;	// Data tiddlywiki instance
	$rt.context.$dash = $dash;	// dash proxy server
	$rt.context.$code = $code;	// code proxy server
	$rt.context.$data = $data;	// data proxy server

	// Application objects
	$rt.context.$sockets = $sockets; // clients connected to server
	$rt.context.$tpi = { fn: { io:{} }, topic: {} }; // tw5-pocket-io code
	$rt.context.$tmp = {}; // object for temporary use

	$rt.setPrompt(hue('tw5-pocket-io > ',214));
}
$rt.on('reset', () => {
	replContext();
	loadCodeToRepl();
})

// Pull JavaScript code from code wiki into REPL
const { replGetCode } = require('./lib/replGetCode');

function loadCodeToRepl() {
	hog('\nREPL startup...', 156);
	// 'startup project' loads first
	var projectFilter = '[tag[$:/pocket-io/code/startup]]';

	// The rest of the projects with 'autoLoad field === 'yes'
	var	filter = '[tag[Projects]]';
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		if (title !== 'startup') {
			var projectTid = $cw.wiki.getTiddler(title);
			if (projectTid && projectTid.fields && projectTid.fields.autoLoad === 'yes') {
				projectFilter += `[tag[$:/pocket-io/code/${title}]]`;
			}
		}
	})

	// Load the code tiddlers from code wiki into REPL
	var hadErrors = replGetCode($rt, $cw, projectFilter);
	hog(`REPL startup complete - tw instance $rw ${hadErrors ? hue(' - with an error in a code tiddler', 163) : ''}`, 156);
}

// Each proxy server startup
// proxy to Dashboard webserver
function dashListen(next) {
	if (dashboardWebserver) {
		$dash.http.listen(dashProxyPort, proxyhost, () => {
			log(`\n$dash dashboard proxy server to ` + hue($dash.proxyTarget,156) + ` started`)
			hog(`Serving on http://${proxyhost}:${dashProxyPort}`,185);
			return next;
		})
	} else {
		hog(`\n$dash dashboard proxy server disabled\n TiddlyWiki Webserver was disabled`,9);
		return next;
	}
}
// proxy to codebase webserver
function codeListen(next) {
	if (codebaseWebserver) {
		$code.http.listen(codeProxyPort, proxyhost, () => {
			log(`$code codebase proxy server to ` + hue($code.proxyTarget,156) + ` started`)
			hog(`Serving on http://${proxyhost}:${codeProxyPort}`,185);
			return next;
		})
	} else {
		hog(`\n$code codebase proxy server disabled\n TiddlyWiki Webserver was disabled`,9);
		return next;
	}
}
// proxy to database webserver
function dataListen() {
	$data.http.listen(dataProxyPort, proxyhost, () => {
		log(`$data database proxy server to ` + hue($data.proxyTarget,156) + ` started`)
		hog(`Serving on http://${proxyhost}:${dataProxyPort}`,185);
		replMOTD();
	})
}

// REPL MOTD and prompt
function replMOTD() {
	hog(`\nPress {up-arrow}{enter} for more info\n`,40);
	$rt.history.push(`cmd.man('repl-tut')`);
	$rt.displayPrompt();
}

// Start the proxy servers to dash, data, and code webservers
function startProxyServers() {
	dataListen(codeListen(dashListen()));
}

// footnote: a good writeup on REPL development
// https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
