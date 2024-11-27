// Starts up the four servers and REPL
//   TW 'server' edition data wiki
//   TW 'server' edition code wiki
//   pocket.io sockets and proxy data server
//   pocket.io sockets and proxy code server

// Reverse proxy target - data & code TW wikis are brought up on local computer
// If running on a different computer - enter IP here
//   Needs to be hard IP address (no lookup) for reverse proxy to work
const proxyTargetIp ='http://127.0.0.1';

// host of '0.0.0.0' network access - host='127.0.0.1' local system only
// dataWikiDir is directory of $data 'server' edition wiki
// dataPort is the $ata 'server' edition wiki port - ie: http://localhost:8082
// codePort is the $Code 'server' edition wiki port - ie: http://localhost:8083
// codeWikiDir is directory of a 'server' edition wiki
const wikihost='127.0.0.1', // local access only since proxy running on this computer
	dataWikiDir = 'wikis/database', dataPort = 8082,
	codeWikiDir = 'wikis/codebase', codePort = 8083;

// pocketDataPort is sockets and reverse proxy to data wiki
// pocketCodePort is sockets and reverse proxy to code wiki
const pockethost='0.0.0.0', // network access for other computers on net
	pocketDataPort = 3000,
	pocketCodePort = 3001;

// data & code express proxy server settings
const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');
var $data = { proxyTarget: `${proxyTargetIp}:${dataPort}`, express, httpProxy, cors };
var $code = { proxyTarget: `${proxyTargetIp}:${codePort}`, express, httpProxy, cors };

// Tiddlywiki instances to data wiki, code wiki, and $tw for REPL
var $dw, $cw, $tw;

// REPL context
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true });
function replContext() {
	$rt.context.$rt = $rt;	// the REPL itself
	$rt.context.$tw = $tw;	// tiddlywiki instance for REPL use
	$rt.context.$dw = $dw;	// Data tiddlywiki instance
	$rt.context.$cw = $cw;	// Code tiddlywiki instance
	$rt.context.$data = $data;	// data proxy server
	$rt.context.$code = $code;	// code proxy server

	$rt.setPrompt(hue('tw5-pocket-io > ',214));
}
$rt.on('reset', () => replContext());

// ----------------------
// Startup the data & code sync servers, REPL, and pocket.io proxy servers
const { twServerBoot } = require('./lib/twServerBoot');
const { replTwBoot } = require('./lib/replTwBoot');

twServerBoot(dataWikiDir, wikihost, dataPort).then(tw => {
	$dw = tw;
	twServerBoot(codeWikiDir, wikihost, codePort).then(tw => {
		$cw = tw;
		replTwBoot().then(tw => {
			$tw = tw;
			loadCodeToRepl();
			startProxyServers();
		})
	})
})
// ----------------------

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const cpy = (obj) => JSON.parse(JSON.stringify(obj));

// Startup
function loadCodeToRepl() {
	hog('\nREPL with TiddlyWiki ($tw) startup...', 156);
	replContext();
	getProjects(); // get code from $code wiki
	hog('REPL startup complete', 156);
}

const { replMOTD } = require('./lib/replMOTD');
function startProxyServers() {
	$data.http.listen(pocketDataPort, pockethost, () => {
		log(`\n'pocket.io' $data proxy server started`)
		hog(`Serving on http://${pockethost}:${pocketDataPort}`,185);
		hog('(press ctrl-C to exit)',9);
		$code.http.listen(pocketCodePort, pockethost, () => {
			log(`'pocket.io' $code proxy server started`)
			hog(`Serving on http://${pockethost}:${pocketCodePort}`,185);
			hog('(press ctrl-C to exit)\n',9);
			replMOTD($rt);
			$rt.displayPrompt();
		})
	})
}

// Pull JavaScript code from $code wiki
function getProjects() {
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

	// Load the code from the tiddlers
	onBootGetCode(projectFilter);
}

// Get code from code wiki into the REPL
// This function is used for initial code load on startup
// A modified  copy is in Code wiki 'startup' project [[startup-getCode]]
const UglifyJS = require('uglify-js'); // Code minify
const { hideStdout } = require('./lib/hideStdout');

function onBootGetCode(filter) {
	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	var tidList = [], errList = [], byteCount = 0;
	hog(`Loading minified $code tiddlers to REPL ...`, 149);
	hog(`Filters:\n${' ' + filter.replace(/\]\]/g, ']]\n ')}`, 149);

	// Do not display the minified code being loaded to REPL
	var showStdout = hideStdout();
	$rt.write('.editor\n');
	$rt.write(`var Done = 'Load complete';\n`);
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	tiddlers.forEach(tiddler => {
		var minified = UglifyJS.minify(tiddler.text);
		if (minified.error) {
			errList.push(hue(`Error processing code tiddler: '${tiddler.title}'\n${minified.error}`,9));
		} else {
			showStdout();
			hog(`Tiddler '${tiddler.title}' ${minified.code.length} bytes`, 149);
			byteCount += minified.code.length;
			hideStdout();
			$rt.write(minified.code + '\n');
			tidList.push(`[[${tiddler.title}]]`);
		}
	})
	$rt.write('Done\n');
	$rt.write(null,{ctrl:true, name:'d'})
	showStdout();

	hog(`\n${tidList.length} code tiddlers loaded - ${(byteCount/1024).toFixed(3)}K bytes.`, 149);
	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);
	errList.forEach(err => {
		log(err);
	})
	if (errList.length) {
		process.exit(1);
	}
}

// footnote: a good writeup on REPL development
// https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
