/*\
 * v0.1.0
Macro that interfaces TiddlyWiki Client to pocket.io server.
\*/

if ($tw.browser) {


// Path to pocket.io library on server
const socketLibrary = '/pocket.io/pocket.io.js';

// Network status
const netStatus = {
	title: '$:/poc2go/SideBarSegment',
	'list-before': '$:/core/ui/SideBarSegments/page-controls',
	tags: '$:/tags/SideBarSegment',
	text: `{{$:/temp/pocket-io/netstat}}`
}
$tw.wiki.addTiddler(new $tw.Tiddler(netStatus));
$tw.wiki.setText('$:/temp/pocket-io/netstat','text', null, 'Pocket.io Initializing...');

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

exports.run = (command, topic, filter, sender) => {
	if (!(sender && $tw.wiki.getTiddler(sender).fields)) {
		console.log(`pocket.io sender tiddler ${sender} required.`);
		return;
	}
	if (command !== 'emit') {
		console.log(`pocket.io  invalid command - ${command}.`);
		return;
	}
	var msg = JSON.stringify(createMessage(command, topic, filter, sender));
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
// Tiddler handling
const story = new $tw.Story();

// Create/overwrite tiddler and add to wiki from hashmap of fields
//  includes timestamps
//  optional display to story and fetch from server fields
const fieldsToWiki = (fields, tostory = false, fromServer = false) => {
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
// Helpers
// Timestamp when tiddler was 'fetched' from server
//  and tags the tiddler as from the server (Default: 'node-red')
const stampFetched = (fields) => {
	return {
		fetched: $tw.utils.stringifyDate(new Date()),
		tags: fields.tags
			? `${fields.tags} repl`
			: `repl`
		};
}


// ------------------------
// Post pocket.io macros and network event handlers
const initialize = () => {
	socket = io();

	// Default tiddler that interfaces to the REPL
	if (!$tw.wiki.tiddlerExists('Pocket-io REPL')) {
		fieldsToWiki(replInterface, true);
	}

	// Macros simplify access to pocket.io server
	$tw.wiki.addTiddler(new $tw.Tiddler(pocketIoDefines));

	socket.on('connect', () => {
		console.log(`pocket.io id: ${sid(socket)} connected`);
		$tw.wiki.setText('$:/temp/pocket-io/netstat','text', null, 'Pocket.io connecting...');
		socket.emit('ackConnect', 'ackConnect');
	})

	socket.on('ackConnect', () => {
		console.log(`pocket.io id: ${sid(socket)} connected`);
		$tw.wiki.setText('$:/temp/pocket-io/netstat','text', null, `Pocket.io Connected ${sid(socket)}`);
	})

	socket.on('msg', msgStr => {
		var msg = $tw.utils.parseJSONSafe(msgStr,{ resultTiddlers: [] });
		msg.resultTiddlers.forEach(tiddler => {
			if (tiddler.title === msg.req.sender) {
				fieldsToWiki(tiddler); // skip forcing sender to story
			} else {
				fieldsToWiki(tiddler, msg.req.tostory);
			}
		})
	})

	socket.on('close', () => {
		console.log('pocket.i0 disconnnected');
		$tw.wiki.setText('$:/temp/pocket-io/netstat','text', null, 'Pocket.io Disconnected');
		socket = null;
		reConnect();
	})

	console.log(`pocket.io initialized`);
}

// Attempt re-connect
function reConnect() {
	if (!socket) {
		setTimeout(() => { initialize(); }, reconnectMs);
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
	// Initialize the network interface
	initialize();
}).catch((err) => {
	console.log(err);
});


})();

const replInterface = {
	title: 'Pocket-io REPL',
	tags: 'pocket-io',
	tostory: 'getData',
	text: `\\define pio()
<$macrocall $name=pocket command=emit topic='eval' filter={{!!sendtext}} sender="$(currentTiddler)$" />
\\end
\\define getData()
<$macrocall $name=pocket command=emit topic={{!!tostory}} filter={{!!wikiFilter}}  sender="$(currentTiddler)$" />
\\end
\\define setData()
<$macrocall $name=pocket command=emit topic='setData' filter={{!!wikiFilter}} sender="$(currentTiddler)$" />
\\end

<style>
.tid-input {
  width:50%;
	font-family: monospace;
	font-size: 1.1em;
}
</style>

<details><summary>Instructions</summary>

Given a TiddlyWiki [[filter|https://tiddlywiki.com/static/Filters.html]] will get tiddlers from the $data wiki and add/change the tiddlers in this single file wiki. For example:

<ul>
<li> Edit [[tw5-pocket-io.png]] and draw something. </li>
<li> Put \`[[tw5-pocket-io.png]]\` as the filter and press 'Store tiddler'.</li>
<li> In another browser tab 'http://localhost:3000'</li>
<li> Put \`[[tw5-pocket-io.png]]\` as the filter and press 'Get tiddler'</li>
</ul>

</details>

Tiddlers can be sent to the $data wiki given filter of tiddlers in this single file wiki and pressing 'Store tiddlers'. Other single file wikis connected to the server can now retrieve them with 'Get tiddlers'. When 'Get tiddlers' can open received tiddlers in the story river.

<$checkbox field="tostory" checked="getDataTostory" unchecked="getData" default="getData"> open in story?</$checkbox>

Filter: <$edit-text field='wikiFilter' class="tid-input"/>
<$button actions="<<getData>>"> Get tiddlers </$button>
<$button actions="<<setData>>"> Store tiddlers </$button>

----

Commands can be sent to the REPL by entering the command and press 'Send'. Ex: \`$dw.wiki.getTiddlers()\`

<$edit-text field="sendtext" class="tid-input"/>
<$button actions="<<pio>>"> Send </$button>

<$button> <$action-setfield $tiddler="$:/temp/pocket-io/repldata" text=""/> Clear display </$button>

{{$:/temp/pocket-io/repldata}}

`
}

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