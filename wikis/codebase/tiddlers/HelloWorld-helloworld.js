// Server-side topics are passed the socket and msg from client wiki
function helloworld(socket, msg) {
	// dir(msg,3) // Display msg on server console

	// Copy the tiddler that sent the request
	var senderTid = cpy(msg.senderTiddler);
	// Clear the tiddler field that holds the response text
	senderTid.ioResult = '';

	var title = senderTid.title;
	var resultText = `${new Date().toString()}\n\nHello tiddler '[[${title}]]' !`;

	// Format the respone text - see $:/pocket-io/ioResult-template
	senderTid.ioResult = formatIoResult(resultText);
	// Push the tiddler onto array that is sent back to client wiki
	msg.resultTiddlers.push(senderTid);
	return msg;
}
// Assign 'helloworld' function as a server topic
$topics.helloworld = helloworld;

// Example Tiddler that calls server topic 'hellowrld'
/*
title: Hello
tags: HelloWorld example
type: text/vnd.tiddlywiki

<$button actions="<<pocket-io 'helloworld'>>">Hello World</$button>

{{!!ioResult}}
*/