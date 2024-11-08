// host='0.0.0.0' network access - host='127.0.0.1' local system only
const host='0.0.0.0', codePort = 8082, dataPort = 8083, pocketPort = 3000;

// Node.js REPL
const repl = require('node:repl');

// Manage sync servers and removal of code comments
const { twSyncBoot, twSyncServer } = require('./lib/twSyncServer');
const { removeBlockComments } = require('./lib/removeBlockComments');

// ----------------------
// Pocket.io server setup
const express = require('express');
const app = express();
const http = require('node:http').Server(app);
const io = require('pocket.io')(http);

// Deliver default single file wiki
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/tw5-pocket.html');
});
// root directory of HTTP server
app.use(express.static('public'));

// ----------------------
// REPL context setup
var rt;
function replContext() {
	rt.context.rt = rt;
	rt.context.io = io;
	rt.context.$tw = $tw;
	rt.context.$dw = $dw;
	rt.context.$cw = $cw;
	rt.context.$data = $dw.wiki;
	rt.context.$code = $cw.wiki;
	rt.context.getCode = getCode;

	rt.setPrompt(hue('tw5-pocket-io > ',214));
}

// ----------------------
// Helpers
const log = (...args) => {console.log(...args);}
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const sub = (cmd, key) => { process.nextTick(() => { rt.write(cmd, key); }); };
	// sub key - ctrl-c = sub(null, {ctrl: true, name: 'c'})

// ----------------------
// Startup the code & data sync servers, REPL, and pocket.io server
codebaseBoot().then (() => {
	databaseBoot().then (() => {
		replTwBoot().then (() => {
			// REPL startup
			rt = repl.start({ prompt: '', ignoreUndefined: true });
			rt.on('reset', () => replContext());
			replContext();
			log(hue('REPL startup complete', 156));
			// Pocket.io server
			http.listen(pocketPort, host, () => {
				log(`\n'pocket.io' server started`)
				log(hue(`Serving on http://${host}:${pocketPort}`,185));
				log(hue('(press ctrl-C to exit)\n',9));
				sub(`getCode('[tag[$:/pocket-io/tabs/startup]]')\n`);
				rt.displayPrompt();
			})
		})
	})
})
// ----------------------

// ----------------------
// TiddlyWiki instances
// Wiki containing JavaScript code tiddlers can be import to REPL
var $cw, codebaseServer;
function codebaseBoot() {
	return new Promise((resolve) => {
		if ($cw) {
			resolve(`$cw v${$cw.version} already running`);
			return;
		}
		$cw = require('tiddlywiki').TiddlyWiki();
		$cw.boot.argv = ['codebase']; // TW 'server' edition wiki
		$cw.boot.boot(() => {
			codebaseServer = new twSyncServer($cw, host, codePort, resolve)
			codebaseServer.twListen();
		});
	})
}

// Shared tiddler wiki
var $dw, databaseServer;
function databaseBoot() {
	return new Promise((resolve) => {
		if ($dw) {
			resolve(`$dw v${$dw.version} already running`);
			return;
		}
		$dw = require('tiddlywiki').TiddlyWiki();
		$dw.boot.argv = ['database']; // TW 'server' edition wiki
		$dw.boot.boot(() => {
			log();
			databaseServer = new twSyncServer($dw, host, dataPort, resolve)
			databaseServer.twListen();
		});
	})
}

// TiddlyWiki instance for the REPL
var $tw;
function replTwBoot() {
	return new Promise((resolve) => {
		if ($tw) {
			resolve(`$twRepl v${$dw.version} already running`);
			return;
		}
		$tw = require('tiddlywiki').TiddlyWiki();
		$tw.boot.argv = ['repl-tw']; // TW output dir
		$tw.boot.boot(() => {
			log(hue('\nREPL TiddlyWiki ($tw) started', 156));
			resolve();
		});
	})
}
// ----------------------
// Built-in fuctions accessable by REPL

// Get code from codebase wiki into the REPL
function getCode(filter, show = false, viewOnly = false) {
	const prevHistory = cpy(rt.history);
	const prevPrompt = rt.getPrompt(); rt.setPrompt('');

	var type = 'text/plain';
	var parser = $cw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');

	var lnCount = 0;
	rt.write('.editor\n');
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		var widgetNode = $cw.wiki.makeWidget(
				parser,
				{variables: $cw.utils.extend({},
					{currentTiddler: title,storyTiddler: title})}
		);
		var container = $cw.fakeDocument.createElement("div");
		widgetNode.render(container,null);
		var text = container.textContent;
		text = removeBlockComments(text);
		text.split('\n').forEach(line => {
			if (line !== '') {
				rt.write(`${line.trim()}\n`);
				lnCount++;
			}
		})
	})
	rt.write(null,{ctrl:true, name:'d'})
	rt.history = prevHistory;
	rt.setPrompt(prevPrompt);
  return `${lnCount} code lines evaluated`;
}


// REPL info - https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
