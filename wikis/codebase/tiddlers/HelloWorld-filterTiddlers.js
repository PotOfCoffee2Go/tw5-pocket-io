// Server-side topics are passed the socket and msg from client wiki
$tpi.topic.filterTiddlers = function filterTiddlers(socket, msg, $tw) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var filter = '[tags[]!is[system]sort[title]]';
	var json = $tw.wiki.filterTiddlers(filter);
	var resultText = `Filter: ${filter}\n\n` + JSON.stringify(json,null,2);

	senderTid.ioResult = $tpi.fn.formatIoResult(resultText);
	msg.resultTiddlers.push(senderTid);
	return msg;
}
