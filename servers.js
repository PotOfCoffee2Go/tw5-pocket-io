// Starts up four servers and a REPL
//   TW 'server' edition data wiki
//   TW 'server' edition code wiki
//   pocket.io sockets and proxy data server
//   pocket.io sockets and proxy code server

// Reverse proxy target - data & code TW wikis are brought up on local computer
// If running on a different computer - enter IP here
//   Needs to be hard IP address (no lookup) for reverse proxy to work
const proxyTargetIp ='http://127.0.0.1';

// host of '0.0.0.0' network access - host='127.0.0.1' local system only
// dataWikiDir is directory of data 'server' edition wiki
// dataPort is the ata 'server' edition wiki port - ie: http://localhost:8082
// codeWikiDir is directory of code 'server' edition wiki
// codePort is the Code 'server' edition wiki port - ie: http://localhost:8083
const wikihost='127.0.0.1', // local access only since proxy running on this computer
	dataWikiDir = 'wikis/database', dataPort = 8082,
	codeWikiDir = 'wikis/codebase', codePort = 8083;

// pocketDataPort is sockets with a reverse proxy to data wiki
// pocketCodePort is sockets with a reverse proxy to code wiki
const pockethost='0.0.0.0', // access from network
	pocketDataPort = 3000,
	pocketCodePort = 3001;

// REPL
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true });

// data & code proxy server settings
var $data = { proxyTarget: `${proxyTargetIp}:${dataPort}` };
var $code = { proxyTarget: `${proxyTargetIp}:${codePort}` };

// Startup the system
const { twServerBoot } = require('./lib/twServerBoot');
const { replTwBoot } = require('./lib/replTwBoot');

var $dw, $cw, $tw;
twServerBoot(dataWikiDir, wikihost, dataPort).then(tw => {
	$dw = tw;
	twServerBoot(codeWikiDir, wikihost, codePort).then(tw => {
		$cw = tw;
		replTwBoot().then(tw => {
			$tw = tw;
			replContext();
			loadCodeToRepl();
			startProxyServers();
		})
	})
})


// -------------------

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

// REPL context
function replContext() {
	$rt.context.$rt = $rt;	// the REPL itself
	$rt.context.$tw = $tw;	// tiddlywiki instance for REPL use
	$rt.context.$dw = $dw;	// Data tiddlywiki instance
	$rt.context.$cw = $cw;	// Code tiddlywiki instance
	$rt.context.$data = $data;	// data proxy server
	$rt.context.$code = $code;	// code proxy server

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
	replGetCode($rt, $cw, projectFilter);
	hog('REPL startup complete', 156);

}

// Start the socket/proxy server to data and code wikis
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

// footnote: a good writeup on REPL development
// https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
