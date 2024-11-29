// Server-side topics are passed the socket and msg from client wiki
function filterTiddlers(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var filter = '[tags[]!is[system]sort[title]]';
	var json = $dw.wiki.filterTiddlers(filter);
	var resultText = `Filter: ${filter}\n\n` + JSON.stringify(json,null,2);

	senderTid.ioResult = $tpi.fn.formatIoResult(resultText);
	msg.resultTiddlers.push(senderTid);
	return msg;
}

$topics.filterTiddlers = filterTiddlers;
