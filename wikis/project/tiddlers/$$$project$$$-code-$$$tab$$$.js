$tpi.topic.$$$tab$$$ = function $$$tab$$$(socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';
  var responseText = `Topic '$$$tab$$$' has been called from wiki '${msg.req.wikiName}' tiddler '${senderTid.title}'`;

	// Display on console
	tog(responseText);
	
	// Display on client - {{!!ioResult}}
	senderTid.ioResult = $tpi.fn.formatIoResult(responseText);
	msg.resultTiddlers.push(senderTid);
	return msg;
}