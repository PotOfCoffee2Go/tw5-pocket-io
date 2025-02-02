// Starter code for making server-side topic
//  ex: <<pocket-io '$$$tab$$$'>>
$tpi.topic.$$$tab$$$ = function (socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var sender = cpy(msg.senderTiddler);
	sender.ioResult = '';
  
	var responseText = `Topic '$$$tab$$$' has been called from wiki '${msg.req.wikiName}' tiddler '${sender.title}'`;

	// Display on console
	tog(responseText);
	
	// Display result on client - {{!!ioResult}}
	sender.ioResult = responseText;
	// Send the tiddler back to the client
	msg.resultTiddlers.push(sender);
	return msg;
}