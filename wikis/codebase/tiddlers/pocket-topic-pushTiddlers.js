// Copy tiddlers from web client to $data database wiki
$tpi.topic.pushTiddlers = function pushTiddlers(socket, msg, $tw) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	msg.filterTiddlers.forEach(tiddler => {
		$tw.wiki.addTiddler(new $tw.Tiddler(
			$tw.wiki.getCreationFields(),
			tiddler,
			$tw.wiki.getModificationFields(),
		))
	})

	senderTid.ioResult = $tpi.fn.formatIoResult(`{{!!modified}}\n\n${msg.filterTiddlers.length} tiddlers updated on wiki`);

	msg.resultTiddlers.push(senderTid);
	return msg;
}