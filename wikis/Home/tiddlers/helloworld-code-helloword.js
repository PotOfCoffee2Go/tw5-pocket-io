// Server-side topics are passed the socket and msg
//  from connected client 
$tpi.topic.helloworld = function (socket, msg) {
	// dir(msg,3) // Display pocket.io msg on server console

	// Copy the tiddler that sent the request
	var sender = cpy(msg.senderTiddler);
	// Clear the tiddler field that holds the response text
	sender.ioResult = '';

	// Do smething here - for example:
	var title = sender.title;
	var resultText = `Hello tiddler '[[${sender.title}]]' !!!`;

	// Place a short reply in ioResult
	sender.ioResult = resultText;
	// Push tiddlers onto array of tiddlers that are
	// sent back to client - will automatically update the
	//  client wiki with any tiddlers in msg.resultTiddlers array
	msg.resultTiddlers.push(sender);
	// Tell all clients connected to destination wiki to refresh
	$tpi.fn.io.refreshClients(msg.req.wikiName);
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