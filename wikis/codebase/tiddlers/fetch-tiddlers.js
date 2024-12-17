$tpi.topic.fetchJsonTiddlers = function fetchJsonTiddlers(socket, msg, $tw) {
	var senderTid = cpy(msg.senderTiddler);
	var resultMsg = '';
	senderTid.ioResult = '';

	var url = senderTid.ioUrl;

	var titles = [];
	$tpi.fn.fetchJsonUrl(url).then(maybeTiddlers => {
		msg.resultTiddlers = []; // reset result tiddlers
		if (!Array.isArray(maybeTiddlers)) { maybeTiddlers = [maybeTiddlers]; }
		maybeTiddlers.forEach(maybe => {
			if (maybe.title) {
				msg.resultTiddlers.push(maybe);
				titles.push(`[[${maybe.title}]]`);
			}
		})
		senderTid.ioResult = $tpi.fn.formatIoResult(`Fetched:\n\n ${titles.join(', ')}`);
		msg.resultTiddlers.unshift(senderTid); // put sender as first tiddler in response
		socket.emit('msg', JSON.stringify(msg));
		return;
	})

	senderTid.ioResult = $tpi.fn.formatIoResult(`Fetching URL... ${url}`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}
