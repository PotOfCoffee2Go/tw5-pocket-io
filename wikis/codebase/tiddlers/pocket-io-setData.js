// Load tiddlers to $data database
function setData(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	msg.filterTiddlers.forEach(tiddler => {
		$dw.wiki.addTiddler(new $dw.Tiddler(
			$dw.wiki.getCreationFields(),
			tiddler,
			$dw.wiki.getModificationFields(),
		))
	})

	senderTid.ioResult = `${msg.filterTiddlers.length} tiddlers updated on $data wiki`;
	msg.resultTiddlers.push(senderTid);
	return msg;
}

topics.setData = setData;
