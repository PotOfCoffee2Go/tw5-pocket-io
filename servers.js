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
	dashWikiDir = 'wikis/dashbase', dashPort = 8082,
	codeWikiDir = 'wikis/codebase', codePort = 8083,
	dataWikiDir = 'wikis/database', dataPort = 8084;

// pocketDataPort is sockets with a reverse proxy to data wiki
// pocketCodePort is sockets with a reverse proxy to code wiki
const pockethost='0.0.0.0', // access from network
	pocketDashPort = 3000,
	pocketCodePort = 3001;
	pocketDataPort = 3002;

// REPL
var $rt = require('node:repl').start({ prompt: '', ignoreUndefined: true });

// data & code proxy server settings
var $dash = { proxyTarget: `${proxyTargetIp}:${dashPort}` };
var $data = { proxyTarget: `${proxyTargetIp}:${dataPort}` };
var $code = { proxyTarget: `${proxyTargetIp}:${codePort}` };

// Startup the system
const { twServerBoot } = require('./lib/twServerBoot');
const { replTwBoot } = require('./lib/replTwBoot');

var $ds, $dw, $cw, $tw, $sockets = {};
twServerBoot(dashWikiDir, wikihost, dashPort).then(tw => {
	$ds = tw;
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
})


// -------------------

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

// REPL context
function replContext() {
	$rt.context.$rt = $rt;	// the REPL itself
	$rt.context.$tw = $tw;	// tiddlywiki instance for REPL use
	$rt.context.$ds = $ds;	// Dash tiddlywiki instance
	$rt.context.$dw = $dw;	// Data tiddlywiki instance
	$rt.context.$cw = $cw;	// Code tiddlywiki instance
	$rt.context.$dash = $dash;	// dashboard proxy server
	$rt.context.$data = $data;	// data proxy server
	$rt.context.$code = $code;	// code proxy server
	$rt.context.$sockets = $sockets;

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

// Start the socket/proxy server to dash, data, and code wikis
function replMOTD() {
	hog(`Welcome to TW5-pocket-io\n`, 40);
	hog(`Type: cmd.cog('REPL-MOTD-MSG') for more info.`, 40);
	hog('  Is in the command history - just press up-arrow then enter.', 40);
	hog('');
	$rt.history.push(`cmd.cog('REPL-MOTD-MSG')`);
	$rt.history.push(`$dash.`);
	$rt.displayPrompt();
}

function startProxyServers() {
	$dash.http.listen(pocketDashPort, pockethost, () => {
		log(`\n'pocket.io' $dash dashboard proxy server started`)
		hog(`Serving on http://${pockethost}:${pocketDashPort}`,185);
		hog('(press ctrl-C to exit)',9);
		$data.http.listen(pocketDataPort, pockethost, () => {
			log(`'pocket.io' $data database proxy server started`)
			hog(`Serving on http://${pockethost}:${pocketDataPort}`,185);
			hog('(press ctrl-C to exit)',9);
			$code.http.listen(pocketCodePort, pockethost, () => {
				log(`'pocket.io' $code codebase proxy server started`)
				hog(`Serving on http://${pockethost}:${pocketCodePort}`,185);
				hog('(press ctrl-C to exit)\n',9);
				replMOTD();
			})
		})
	})
}

// footnote: a good writeup on REPL development
// https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
