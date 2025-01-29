// Copy tiddlers from $data database wiki to web client
$tpi.topic.pullTiddlers = function pullTiddlers(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	msg.resultTiddlers = $tw.utils.parseJSONSafe(
		$tw.wiki.getTiddlersAsJson(msg.req.filter), []);
	senderTid.ioResult = $tpi.fn.formatIoResult(`{{!!modified}}\n\n${msg.resultTiddlers.length} tiddlers recieved from wiki`);

	msg.resultTiddlers.push(senderTid);
	return msg;
}

