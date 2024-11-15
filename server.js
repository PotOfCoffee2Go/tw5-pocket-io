// Domain is the protocal and address to access this server
// Needs to be IP address (no lookup) for reverse proxy to work
const proxyTargetIp ='http://127.0.0.1';

// host='0.0.0.0' network access - host='127.0.0.1' local system only
// codePort is the $Code 'server' edition wiki port - ie: http://localhost:8082
// dataPort is the $Data 'server' edition wiki port - ie: http://localhost:8083
const host='0.0.0.0', codePort = 8082, dataPort = 8083, pocketPort = 3000;

// Node.js REPL
const repl = require('node:repl');

// Manage server edition sync servers and minify of code tiddlers
const cors = require('cors')
const { twSyncBoot, twSyncServer } = require('./lib/twSyncServer');
const UglifyJS = require("uglify-js");

// ----------------------
// Pocket.io server
const express = require('express');
const app = express();
const http = require('node:http').Server(app);
const io = require('pocket.io')(http);

// Router that is loaded by $Code wiki JavaScript tiddlers
const router =  express.Router();

// reverse-proxy the $code wiki
const httpProxy = require('http-proxy');
const twProxy = httpProxy.createProxyServer();
const codeWiki = `${proxyTargetIp}:${codePort}`;

// Allow all to access
app.options('*', cors()); // handles some rare CORS cases
app.use(cors());

// Deliver default single file wiki
router.get('/pocket', (req, res) => {
	res.sendFile(__dirname + '/public/tw5-pocket.html');
});

// roote directory of static content
app.use(express.static('public'));

// Routes that are loaded when $Code wiki is started
app.use(router);

// $Code server edition wiki proxy
//  needs to be last route as it handles
//  all requests except those handled above
app.all('/*', (req, res) => {
	twProxy.web(req, res, {target: codeWiki});
});

// ----------------------
// REPL context
var rt;
function replContext() {
	rt.context.rt = rt;		// the REPL itself
	rt.context.io = io;		// pocket.io websockets (tiddlers)
	rt.context.app = app;	// express (this) web server instance
	rt.context.$tw = $tw;	// tiddlywiki instance for REPL use
	rt.context.$dw = $dw;	// $Data tiddlywiki instance
	rt.context.$cw = $cw;	// $Code tiddlywiki instance
	rt.context.router = router;		// express routing table
	rt.context.twProxy = twProxy;
	rt.context.UglifyJS = UglifyJS; // code minify

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
				getApps();
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
		$cw.boot.argv = ['wikis/codebase']; // TW 'server' edition wiki
		$cw.boot.boot(() => {
			codebaseServer = new twSyncServer($cw, host, codePort, resolve)
			codebaseServer.twListen();
		});
	})
}

// Shared data tiddlers wiki
var $dw, databaseServer;
function databaseBoot() {
	return new Promise((resolve) => {
		if ($dw) {
			resolve(`$dw v${$dw.version} already running`);
			return;
		}
		$dw = require('tiddlywiki').TiddlyWiki();
		$dw.boot.argv = ['wikis/database']; // TW 'server' edition wiki
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

// Load the javascript code from $Code wiki
function getApps() {
	// 'startup project' loads first
	var appFilter = '[tag[$:/pocket-io/tabs/startup]]';

	// The rest of the projects with 'autoLoad field === 'yes'
	var	filter = '[tag[Apps]]';
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		if (title !== 'startup') {
			var appTid = $cw.wiki.getTiddler(title);
			if (appTid && appTid.fields && appTid.fields.autoLoad === 'yes') {
				appFilter += `[tag[$:/pocket-io/tabs/${title}]]`;
			}
		}
	})

	// Load the code from the tiddlers
	getCode(appFilter);
}

// ----------------------
// Get code from codebase wiki into the REPL
// This function is used for initial load on startup
// A copy is in $Code database [[startup-getCode]]
//   for use once system has been loaded
function getCode(filter) {
	const prevHistory = cpy(rt.history);
	const prevPrompt = rt.getPrompt(); rt.setPrompt('');

	var parser = $cw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');

	var tidCount = 0, errList = [];
	log(hue(`Loading ${filter} code tiddlers to server ...`,149));
	rt.write('.editor\n');
	rt.write(`var Done = 'Load complete';\n`);
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		var widgetNode = $cw.wiki.makeWidget(parser,
			{variables: $cw.utils.extend({},
				{currentTiddler: title, storyTiddler: title})
			}
		);
		var container = $cw.fakeDocument.createElement("div");
		widgetNode.render(container,null);
		var tiddlerText = container.textContent;
		var minified = UglifyJS.minify(tiddlerText);
		if (minified.error) {
			errList.push(hue(`Error processing code tiddler: '${title}'\n${minified.error}`,9));
		} else {
			log(hue(`\nTiddler '${title}'`, 149));
			rt.write(minified.code + '\n');
			tidCount++;
		}
	})
	rt.write('Done\n');
	rt.write(null,{ctrl:true, name:'d'})
	log(hue(`Code loaded from $code database\n${filter} --> ${tidCount} code tiddlers loaded.`, 149));
	rt.history = prevHistory;
	rt.setPrompt(prevPrompt);
	errList.forEach(err => {
		log(err);
	})
	if (errList.length) {process.exit(1);}
}

// REPL info - https://www.cs.unb.ca/~bremner/teaching/cs2613/books/nodejs-api/repl/
