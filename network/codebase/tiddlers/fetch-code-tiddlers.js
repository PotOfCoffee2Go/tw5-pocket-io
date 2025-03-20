$tpi.topic.fetchJsonTiddlers = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var resultMsg = '';
	sender.ioResult = '';

	// localhost does not work on my network
	//  your milage may vary
	var url = sender.ioUrl.replace('//localhost', '//127.0.0.1');

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
		sender.ioResult = `Fetched:\n\n ${titles.join(', ')}`;
		msg.resultTiddlers.unshift(sender); // put sender as first tiddler in response
		socket.emit('msg', msg);
		return;
	})

	sender.ioResult = `Fetching URL... ${url}`;
	msg.resultTiddlers.push(sender);
	return msg;
}
