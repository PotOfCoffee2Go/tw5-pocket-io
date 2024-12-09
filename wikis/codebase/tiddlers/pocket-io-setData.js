// Copy tiddlers from web client to $data database wiki
$tpi.topic.setData = function setData(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	msg.filterTiddlers.forEach(tiddler => {
		$dw.wiki.addTiddler(new $dw.Tiddler(
			$dw.wiki.getCreationFields(),
			tiddler,
			$dw.wiki.getModificationFields(),
		))
	})

	senderTid.ioResult = $tpi.fn.formatIoResult(`{{!!modified}}\n\n${msg.filterTiddlers.length} tiddlers updated on $data wiki`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}
