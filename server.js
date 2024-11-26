// Reverse proxy target - data & code TW wikis are brought up on local computer
// If running on a different computer - enter IP here
//   Needs to be hard IP address (no lookup) for reverse proxy to work
const proxyTargetIp ='http://127.0.0.1';

// host of '0.0.0.0' network access - host='127.0.0.1' local system only
// dataWikiDir is directory of $data 'server' edition wiki
// dataPort is the $ata 'server' edition wiki port - ie: http://localhost:8083

// codePort is the $Code 'server' edition wiki port - ie: http://localhost:8082
// codeWikiDir is directory of a 'server' edition wiki
const wikihost='127.0.0.1', // local access
	dataWikiDir = 'wikis/database', dataPort = 8083,
	codeWikiDir = 'wikis/codebase', codePort = 8082;

// pocketDataPort is sockets and reverse proxy to $data wiki
// pocketCodePort is sockets and reverse proxy to $code wiki
const pockethost='0.0.0.0', // network access
	pocketDataPort = 3000,
	pocketCodePort = 3001;

// Tiddlywiki instances to $data wiki, $code wiki, and $tw in REPL
var $dw, $cw, $tw;
// $data & $code express proxy servers
const { PocketProxyServer } = require('./lib/pocketProxyServer');
const $data = new PocketProxyServer(`${proxyTargetIp}:${dataPort}`);
const $code = new PocketProxyServer(`${proxyTargetIp}:${codePort}`);

// REPL context
var rt = require('node:repl').start({ prompt: '', ignoreUndefined: true });
function replContext() {
	rt.context.rt = rt;		// the REPL itself
	rt.context.$tw = $tw;	// tiddlywiki instance for REPL use
	rt.context.$dw = $dw;	// $Data tiddlywiki instance
	rt.context.$cw = $cw;	// $Code tiddlywiki instance
	rt.context.$data = $data;	// $data proxy server
	rt.context.$code = $code;	// $code proxy server

	rt.setPrompt(hue('tw5-pocket-io > ',214));
}
rt.on('reset', () => replContext());

// ----------------------
// Startup the data & code sync servers, REPL, and pocket.io proxy servers
// Server edition sync servers and RPL
const { twServerBoot } = require('./lib/twServerBoot');
const { replTwBoot } = require('./lib/replTwBoot');

twServerBoot(dataWikiDir, wikihost, dataPort).then (tw => {
	$dw = tw;
	twServerBoot(codeWikiDir, wikihost, codePort).then (tw => {
		$cw = tw;
		replTwBoot().then (tw => {
			$tw = tw;
			loadCodeToRepl();
			startProxyServers();
		})
	})
})
// ----------------------

const log = (...args) => {console.log(...args);}
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const sub = (cmd, key) => { process.nextTick(() => { rt.write(cmd, key); }); };
// sub usage: ctrl-d = sub(null, {ctrl: true, name: 'd'})

// Startup
function loadCodeToRepl() {
	log(hue('\nREPL with TiddlyWiki ($tw) startup...', 156));
	replContext();
	getApps(); // get code from $code wiki
	log(hue('REPL startup complete', 156));
}

const { replMOTD } = require('./lib/replMOTD');
function startProxyServers() {
	$data.http.listen(pocketDataPort, pockethost, () => {
		log(`\n'pocket.io' $data proxy server started`)
		log(hue(`Serving on http://${pockethost}:${pocketDataPort}`,185));
		$code.http.listen(pocketCodePort, pockethost, () => {
			log(`'pocket.io' $code proxy server started`)
			log(hue(`Serving on http://${pockethost}:${pocketCodePort}`,185));
			log(hue('(press ctrl-C to exit)\n',9));
			replMOTD(rt);
			rt.displayPrompt();
		})
	})
}

// Pull JavaScript code from $code wiki
function getApps() {
	// 'startup project' loads first
	var appFilter = '[tag[$:/pocket-io/code/startup]]';

	// The rest of the projects with 'autoLoad field === 'yes'
	var	filter = '[tag[Apps]]';
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		if (title !== 'startup') {
			var appTid = $cw.wiki.getTiddler(title);
			if (appTid && appTid.fields && appTid.fields.autoLoad === 'yes') {
				appFilter += `[tag[$:/pocket-io/code/${title}]]`;
			}
		}
	})

	// Load the code from the tiddlers
	onBootGetCode(appFilter);
}

// Get code from codebase wiki into the REPL
// This function is used for initial code load on startup
// A modified  copy is in $Code 'startup' project [[startup-getCode]]
const UglifyJS = require('uglify-js'); // Code minify
const { hideStdout } = require('./lib/hideStdout');

function onBootGetCode(filter) {
	const prevHistory = cpy(rt.history);
	const prevPrompt = rt.getPrompt(); rt.setPrompt('');

	var tidList = [], errList = [], byteCount = 0;
	log(hue(`Loading minified $code tiddlers to REPL ...`, 149));
	log(hue(`Filters:\n${' ' + filter.replace(/\]\]/g, ']]\n ')}`, 149));

	// Do not display the minified code being loaded to REPL
	var showStdout = hideStdout();
	rt.write('.editor\n');
	rt.write(`var Done = 'Load complete';\n`);
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	tiddlers.forEach(tiddler => {
		var minified = UglifyJS.minify(tiddler.text);
		if (minified.error) {
			errList.push(hue(`Error processing code tiddler: '${tiddler.title}'\n${minified.error}`,9));
		} else {
			showStdout();
			log(hue(`Tiddler '${tiddler.title}' ${minified.code.length} bytes`, 149));
			byteCount += minified.code.length;
			hideStdout();
			rt.write(minified.code + '\n');
			tidList.push(`[[${tiddler.title}]]`);
		}
	})
	rt.write('Done\n');
	rt.write(null,{ctrl:true, name:'d'})
	showStdout();

	log(hue(`\n${tidList.length} code tiddlers loaded - ${(byteCount/1024).toFixed(2)}K bytes.`, 149));
	rt.history = prevHistory;
	rt.setPrompt(prevPrompt);
	errList.forEach(err => {
		log(err);
	})
	if (errList.length) {
		process.exit(1);
	}
}

// footnote: a good writeup on REPL development
// https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
