function fetchJsonTiddlers(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	var resultMsg = '';
	senderTid.ioResult = '';

	var url = senderTid.ioUrl;

	var titles = [];
	fetchJsonUrl(url).then(maybeTiddlers => {
		msg.resultTiddlers = []; // reset result tiddlers
		if (!Array.isArray(maybeTiddlers)) { maybeTiddlers = [maybeTiddlers]; }
		maybeTiddlers.forEach(maybe => {
			if (maybe.title) {
				msg.resultTiddlers.push(maybe);
				titles.push(`[[${maybe.title}]]`);
			}
		})
		senderTid.ioResult = formatIoResult(`Fetched:\n\n ${titles.join(', ')}`);
		msg.resultTiddlers.unshift(senderTid); // put sender as first tiddler in response
		socket.emit('msg', JSON.stringify(msg));
		return;
	})

	senderTid.ioResult = formatIoResult(`Fetching URL... ${url}`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}

$topics.fetchJsonTiddlers = fetchJsonTiddlers; // is a topic