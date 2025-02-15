// Copy tiddlers from $data database wiki to web client
$tpi.topic.copyTiddlers = function copyTiddlers(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var gotError = false;
	if (!senderTid.ioFromWiki) {
		senderTid.ioResult = `Error: Need the source wiki name to copy the tiddlers from.`;
		gotError = true;
	}
	else if (!senderTid.ioToWiki) {
		senderTid.ioResult = `Error: Need the destination wiki name to copy the tiddlers to`;
		gotError = true;
	}
	else if (!senderTid.ioFilter) {
		senderTid.ioResult = `Error: A filter to select the tiddlers to copy is required`;
		gotError = true;
	}
	else if (senderTid.ioFromWiki === senderTid.ioToWiki) {
		senderTid.ioResult = `Error: Can not copy to the same wiki.`;
		gotError = true;
	}

	// copy tiddlers
	if (!gotError) {
		var $from = get$tw(senderTid.ioFromWiki);
		var $to = get$tw(senderTid.ioToWiki);
		var tiddlers = $from.utils.parseJSONSafe(
			$from.wiki.getTiddlersAsJson(senderTid.ioFilter), []);
		tiddlers.forEach(tiddler => {
			$to.wiki.addTiddler(new $to.Tiddler(tiddler));
			// send system tiddlers to client via sockets
			if (/^\$:\//.test(tiddler.title)) {
				msg.resultTiddlers.push(tiddler);
			}
		})
		senderTid.ioResult = `${tiddlers.length} tiddlers copied from ${senderTid.ioFromWiki} to ${senderTid.ioToWiki}`;
	}	

	msg.resultTiddlers.push(senderTid);
	return msg;
}
