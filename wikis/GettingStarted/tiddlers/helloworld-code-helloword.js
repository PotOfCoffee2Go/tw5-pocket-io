// Server-side topics are passed the socket and msg from client wiki
$tpi.topic.helloworld = function (socket, msg) {
	// dir(msg,3) // Display pocket.io msg on server console

	// Copy the tiddler that sent the request
	var sender = cpy(msg.senderTiddler);
	// Clear the tiddler field that holds the response text
	sender.ioResult = '';

	var title = sender.title;
	var resultText = `Hello tiddler '[[${title}]]' !`;

	// Format the respone text - see $:/pocket-io/ioResult-template
	sender.ioResult = $tpi.fn.formatIoResult(resultText);
	// Push the tiddler onto array that is sent back to client wiki
	msg.resultTiddlers.push(sender);
	return msg;
}

// ------------------
// Example Tiddler that calls server topic 'helloworld'
/*
title: Hello
tags: HelloWorld example
type: text/vnd.tiddlywiki

<$button actions="<<pocket-io 'helloworld'>>">Hello World</$button>

{{!!ioResult}}
*/