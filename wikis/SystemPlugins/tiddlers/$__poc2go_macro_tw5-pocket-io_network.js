/*\
 * v0.1.0
Macro that interfaces TiddlyWiki Client to pocket.io server.
\*/

if ($tw.browser) {


// Path to pocket.io library on server
const socketLibrary = '/pocket.io/pocket.io.js';

// Network status
const netStatus = {
	title: '$:/poc2go/pocket-io/SideBarSegment',
	'list-before': '$:/core/ui/SideBarSegments/page-controls',
	tags: '$:/tags/SideBarSegment',
	text: `{{$:/temp/pocket-io/netstat}}`
}
$tw.wiki.addTiddler(new $tw.Tiddler(netStatus));

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Last 12 characters of socket id
const sid = (socket) => socket.id.split('-').pop();

// ------------------------
// Network interface
var socket = null;

// If socket not assigned then display pocket-io as unavailable
setTimeout(() => {
	if (!socket) {
		$tw.wiki.setText('$:/temp/pocket-io/netstat','text', null, 'Pocket.io unavailable');
	}
}, 10000);


// Attempt reconnect to server in milliseconds
const reconnectMs = 10000;

// ------------------------
// TiddlyWiki interface
exports.name = 'pocket';

exports.params = [
	{name: 'command'},
	{name: 'topic'},
	{name: 'filter'},
	{name: 'sender'},
];

exports.run = (command, topic, filter, sender, sender1) => {
	if (!(sender && $tw.wiki.getTiddler(sender).fields)) {
		console.log(`pocket.io sender tiddler ${sender} required.`);
		return;
	}
	if (command !== 'emit') {
		console.log(`pocket.io  invalid command - ${command}.`);
		return;
	}
	var msg = createMessage(command, topic, filter, sender);
	socket.emit('msg', msg);
}

// Message
function createMessage(command, topic, filter, sender) {
	// Merge values passed by macro with senders fields
	// The macro call values takes precidence
	var macroReq = {sender};
	if (command) { macroReq.command = command; }
	if (topic) { macroReq.topic = topic; }
	if (filter) { macroReq.filter = filter; }

	var senderFields = $tw.utils.parseJSONSafe($tw.wiki.getTiddlerAsJson(sender),{});

	var senderReq = {
		command: senderFields.ioCommand,
		topic: senderFields.ioTopic,
		filter: senderFields.ioFilter,
		wikiName: $tw.wiki.getTiddlerText('$:/temp/pocket-io/wikinames'),
		sender: senderFields.title,
		tostory: senderFields.ioTostory === 'yes' ? true : false,
	}
	var msg = {
		req: Object.assign({}, senderReq, macroReq),
		senderTiddler: $tw.utils.parseJSONSafe($tw.wiki.getTiddlerAsJson(sender),{}),
		filterTiddlers: $tw.utils.parseJSONSafe($tw.wiki.getTiddlersAsJson(filter),[]),
		resultTiddlers: []
	}
	return msg;
}

// ------------------------
// Utilities
// Timestamp resolves to the second
function tStamp() {
	return ((new Date()).toLocaleDateString(undefined, {
		hourCycle: 'h23',
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit', second: '2-digit'
		})).replace(',', '') + ' ';
}

// Update network status
function setNetstat(txt) {
	var site = `${location.protocol}//${location.hostname}:${location.port}`;
	$tw.wiki.setText('$:/temp/pocket-io/proxy','text', null, site);
	$tw.wiki.setText('$:/temp/pocket-io/netstat','text', null,
		`@@font-size:1.1em; Wiki: {{$:/temp/pocket-io/wikinames}}@@<br>{{$:/temp/pocket-io/wikinames!!link}}<br>` + txt);
}

// Handle ioResult fields
const resultTemplate = $tw.wiki.getTiddlerText('$:/poc2go/pocket-io/result/template');
const errorTemplate = $tw.wiki.getTiddlerText('$:/poc2go/pocket-io/result/error-template');
const uploadTemplate = $tw.wiki.getTiddlerText('$:/poc2go/pocket-io/result/upload-template');
function formatResults(tiddler) {
	if (!resultTemplate || !errorTemplate || !uploadTemplate) { return tiddler; }
	if (tiddler.ioResult && !/^<div/.test(tiddler.ioResult)) {
		if (/^error: /i.test(tiddler.ioResult)) {
			tiddler.ioResult = errorTemplate
			  .replace('$$$text$$$', tStamp() + tiddler.ioResult.replace(/^error: /i, ''));
		} else {
			tiddler.ioResult = resultTemplate
			  .replace('$$$text$$$', tStamp() + tiddler.ioResult);
		}
	}
	if (tiddler.ioResultUpload && !/^<div/.test(tiddler.ioResultUpload)) {
		tiddler.ioResultUpload = uploadTemplate
		  .replace('$$$text$$$', tStamp() + tiddler.ioResultUpload);
	}
	return tiddler;
}
// ------------------------
// Tiddler handling
const story = new $tw.Story();

// Create/overwrite tiddler and add to wiki from hashmap of fields
//  includes timestamps
//  optional display to story river
const fieldsToWiki = (fields, tostory = false) => {
	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getCreationFields(),
		fields,
		$tw.wiki.getModificationFields(),
	))
	if (tostory) {
		story.navigateTiddler(fields.title /*, fromTitle*/);
	}
}

// ------------------------
// Pocket.io event handlers
const initSocketHandlers = () => {
	socket = io();

	socket.on('connect', () => {
		console.log(`pocket.io id: ${sid(socket)} connecting`);
		setNetstat('Pocket.io connecting...');
		socket.emit('ackConnect', {
			protocol: location.protocol,
			hostname: location.hostname,
			port: location.port
		})
	})

	socket.on('ackConnect', wikiRequires => {
		console.log(`pocket.io id: ${sid(socket)} connected`);
		setNetstat(`Pocket.io connected ${sid(socket)}`);
		wikiRequires.forEach(tiddler => fieldsToWiki(tiddler));
	})

	socket.on('msg', msg => {
		msg.resultTiddlers.forEach(tiddler => {
			if (tiddler.title === msg.req.sender) {
				tiddler = formatResults(tiddler);
				fieldsToWiki(tiddler); // skip sending the sender to the story
			} else {
				fieldsToWiki(tiddler, msg.req.tostory);
			}
		})
		if ($tw.syncer) {
			$tw.syncer.syncFromServer();
		}
	})

	socket.on('refresh', () => {
		console.log('pocket.io request to server-refresh');
		if ($tw.syncer) {
			$tw.syncer.syncFromServer();
		}
	})

	socket.on('close', () => {
		console.log('pocket.i0 disconnnected');
		setNetstat('Pocket.io disconnected');
		socket = null;
		reConnect();
	})

	console.log(`pocket.io initialized`);
}

// Attempt re-connect
function reConnect() {
	if (!socket) {
		setTimeout(() => { initSocketHandlers(); }, reconnectMs);
	}
}


// ------------------------
// Fetch pocket-io library from server
//  load into site <head>,
//   (it will connect to server automatically)
//  initialize pocket.io macros and events

// Is async so TW $:/boot continues loading wiki
//  while uibuilder is being initialized
fetch(socketLibrary).then((res) => {
	// Verify library fetch successful
	if (res.status !== 200) {
		throw new Error(`Unable to fetch pocket.io - HTTP status: ${res.status}`);
	}
	return res.text();
}).then((text) => {
	// Load socket library into browser
	let elem = document.createElement("script");
	elem.innerHTML = text;
	document.head.appendChild(elem);
}).then(() => {
	// Macro to access pocket.io server
	$tw.wiki.addTiddler(new $tw.Tiddler(pocketIoDefines));
	// Initialize the network interface
	setNetstat('Pocket.io Initializing...');
	initSocketHandlers();
}).catch((err) => {
	console.log(err);
});


})();

// Global macros for TiddlyWiki access to server
//  If problems loading the network these macros will not be loaded
//   so TiddlyWiki will quietly do nothing when they are called.
const pocketIoDefines = {
	title: '$:/temp/pocket-io/macros',
	tags: '$:/tags/Macro pocket-io',
	text: `\\define pocket-io(topic filter:"") <$macrocall $name=pocket command=emit topic='$topic$' filter='$filter$' sender="$(currentTiddler)$" />

pocket.io macro
`
};

} // if ($tw.browser)
