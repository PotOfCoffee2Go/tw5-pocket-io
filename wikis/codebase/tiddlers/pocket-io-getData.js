// Copy tiddlers from $data database wiki to web client
function getData(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	msg.resultTiddlers = $tw.utils.parseJSONSafe(
		$dw.wiki.getTiddlersAsJson(msg.req.filter), []);
	senderTid.ioResult = formatIoResult(`{{!!modified}}\n\n${msg.resultTiddlers.length} tiddlers recieved from $data wiki`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}

$topics.getData = getData;
