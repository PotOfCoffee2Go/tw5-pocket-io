$tpi.topic.applySettings = function applySettings(socket, msg) {
	var sender = cpy(msg.senderTiddler);
	sender.ioResult = '';

	var settingList = $rw.utils.parseStringArray(sender.pocketIoSettings);
	settingList = settingList ?? [];
	dir(settingList);
	sender.ioResult = `Received ${settingList.length} settings`;
	msg.resultTiddlers.push(sender);
	return msg;

	var gotError = false;
	if (!sender.ioFromWiki) {
		sender.ioResult = `Error: Need the source wiki name to copy the tiddlers from.`;
		gotError = true;
	}
	else if (!sender.ioToWiki) {
		sender.ioResult = `Error: Need the destination wiki name to copy the tiddlers to`;
		gotError = true;
	}
	else if (!sender.ioFilter) {
		sender.ioResult = `Error: A filter to select the tiddlers to copy is required`;
		gotError = true;
	}
	else if (sender.ioFromWiki === sender.ioToWiki) {
		sender.ioResult = `Error: Can not copy to the same wiki.`;
		gotError = true;
	}

	// copy tiddlers
	if (!gotError) {
		var $from = get$tw(sender.ioFromWiki);
		var $to = get$tw(sender.ioToWiki);
		var tiddlers = $from.utils.parseJSONSafe(
			$from.wiki.getTiddlersAsJson(sender.ioFilter), []);
		tiddlers.forEach(tiddler => {
			$to.wiki.addTiddler(new $to.Tiddler(tiddler));
			// send system tiddlers to client via sockets
			if (/^\$:\//.test(tiddler.title)) {
				msg.resultTiddlers.push(tiddler);
			}
		})
		sender.ioResult = `${tiddlers.length} tiddlers copied from ${sender.ioFromWiki} to ${sender.ioToWiki}`;
	}	

	msg.resultTiddlers.push(sender);
	$refreshClients(sender.ioToWiki);
	return msg;
}	
	
