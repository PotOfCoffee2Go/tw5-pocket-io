// host='0.0.0.0' network access - host='127.0.0.1' local system only
const host='0.0.0.0', codePort = 8082, dataPort = 8083, pocketPort = 3000;

// Node.js REPL
const repl = require('node:repl');
const vm = require('node:vm');

// Manage sync servers and removal of code comments
const { twSyncBoot, twSyncServer } = require('./lib/twSyncServer');
const { removeBlockComments } = require('./lib/removeBlockComments');

// ----------------------
// Helpers
const log = (...args) => {console.log(...args);}
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const sid = (socket) => socket.id.split('-').pop();
const sub = (cmd, key) => { process.nextTick(() => { rt.write(cmd, key); }); };
	// sub key - ctrl-c = sub(null, {ctrl: true, name: 'c'})

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
app.use(express.static('public'));

// ----------------------
// REPL context setup
var rt;
function replContext() {
	rt.context.rt = rt;
	rt.context.$sockets = $sockets;
	rt.context.$tw = $tw;
	rt.context.$cw = $codebase;
	rt.context.$dw = $database;
	rt.context.$code = $codebase.wiki;
	rt.context.$data = $database.wiki;
	rt.context.getCode = getCode;
	rt.context.getData = getData;
	rt.context.setData = setData;

	rt.setPrompt(hue('tw5-pocket-io > ',214));
}

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
				rt.displayPrompt();
			})
		})
	})
})
// ----------------------

// ----------------------
// TiddlyWiki instances

// Wiki containing JavaScript code tiddlers can be import to REPL
var $codebase, codebaseServer;
function codebaseBoot() {
	return new Promise((resolve) => {
		if ($codebase) {
			resolve(`$codebase v${$codebase.version} already running`);
			return;
		}
		$codebase = require('tiddlywiki').TiddlyWiki();
		$codebase.boot.argv = ['codebase']; // TW 'server' edition wiki
		$codebase.boot.boot(() => {
			codebaseServer = new twSyncServer($codebase, host, codePort, resolve)
			codebaseServer.twListen();
		});
	})
}

// Shared tiddler wiki
var $database, databaseServer;
function databaseBoot() {
	return new Promise((resolve) => {
		if ($database) {
			resolve(`$database v${$database.version} already running`);
			return;
		}
		$database = require('tiddlywiki').TiddlyWiki();
		$database.boot.argv = ['database']; // TW 'server' edition wiki
		$database.boot.boot(() => {
			log();
			databaseServer = new twSyncServer($database, host, dataPort, resolve)
			databaseServer.twListen();
		});
	})
}

// TiddlyWiki instance for the REPL
var $tw;
function replTwBoot() {
	return new Promise((resolve) => {
		if ($tw) {
			resolve(`$twRepl v${$database.version} already running`);
			return;
		}
		$tw = require('tiddlywiki').TiddlyWiki();
		$tw.boot.argv = ['repl-tw']; // TW 'server' edition wiki
		$tw.boot.boot(() => {
			log(hue('\nREPL TiddlyWiki ($tw) started', 156));
			resolve();
		});
	})
}

// ----------------------
// Pocket.io implementation
var $sockets = {};
io.on('connection', (socket) => {
	// Reply to a client
	socket.reply = (str) => {
		socket.emit('eval',stringifyTiddler(str));
	}

	socket.on('ackConnect', () => {
		$sockets[sid(socket)] = socket;

		getData(socket, '[tag[onStartup]]');

		log(hue(`Client wiki ${sid(socket)} connected`,44));
		rt.displayPrompt();
	})
  // Client requests command to be evaluated
	socket.on('eval', (jsonTiddlers) => {
		var tiddlers = parseTiddlers(jsonTiddlers);
		if (/^getData\(/.test(tiddlers[0].text)) {
			tiddlers[0].text = tiddlers[0].text.replace('getData(',`getData($sockets['${sid(socket)}'],`);
		}
		rt.write(`$sockets['${sid(socket)}'].reply(${tiddlers[0].text})\n`);
	});

  // Remove from connected sockets
	socket.on('disconnect', () => {
		delete $sockets[socket.id];
		log(hue(`Client wiki ${sid(socket)} disconnected`,128));
		rt.displayPrompt();
	});
});

// ----------------------
// Built-in fuctions accessable by REPL

// Get code from codebase wiki into the REPL
function getCode(filter, show = false, viewOnly = false) {
	const prevHistory = cpy(rt.history);
	const prevPrompt = rt.getPrompt(); rt.setPrompt('');

	var exp = new RegExp('^[\\S\\s]*rt.' + 'ignoreUndefined');
	var rpl = 'rt.' + 'ignoreUndefined';

	var type = 'text/plain';
	var parser = $codebase.wiki.parseTiddler('$:/poc2go/rendered-plain-text');

	var lnCount = 0;
	rt.write('.editor\n');
	$codebase.wiki.filterTiddlers(filter).forEach(title => {
		var widgetNode = $codebase.wiki.makeWidget(
				parser,
				{variables: $codebase.utils.extend({},
					{currentTiddler: title,storyTiddler: title})}
		);
		var container = $codebase.fakeDocument.createElement("div");
		widgetNode.render(container,null);
		var text = container.textContent;
		text = text.replace(exp, rpl);
		text = removeBlockComments(text);
		text.split('\n').forEach(line => {
			if (line !== '') {
				rt.write(`${line.trim()}\n`);
				lnCount++;
			}
		})
	})
	rt.write(null,{ctrl:true, name:'d'})
	rt.setPrompt(prevPrompt);
	rt.history = prevHistory;

	return `${lnCount} code lines evaluated`;
}

// Copy tiddlers from database wiki to client single file wiki
function getData(socket, filter, tostory = false) {
	let tiddlers = $database.wiki.getTiddlersAsJson(filter);
	if (tostory) {
		socket.emit('tostory',tiddlers);
	}
	else {
		socket.emit('tiddlers',tiddlers);
	}
	return `${JSON.parse(tiddlers).length} tiddlers updated`;
}

// Add tiddler to database wiki from client single file wiki
function setData(tiddlers = []) {
	if (!Array.isArray(tiddlers)) { tiddlers = [tiddlers] }
	tiddlers.forEach(tiddler => {
		$database.wiki.addTiddler(new $database.Tiddler(
			$database.wiki.getCreationFields(),
			tiddler,
			$database.wiki.getModificationFields(),
		))
	})
	return `${tiddlers.length} tiddlers updated on $data wiki`;
}

// ----------------------
// Tiddler Helpers for transport on the network
// Given a string - makes into a tiddler that is stringified
function stringifyTiddler(text, title = 'undefined') {
	return JSON.stringify({ title, text });
}

// Given a JSON string of tiddler(s) - makes JS object
function parseTiddlers(jsonTiddlers) {
	var tiddlers;
	try {
		tiddlers = JSON.parse(jsonTiddlers);
	} catch(e) {
		tiddlers = [];
	}
	if (!Array.isArray(tiddlers)) { tiddlers = [tiddlers] }
	return tiddlers;
}


// REPL info - https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
