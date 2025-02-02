// Remove fields that begin with 'io'
$tpi.topic.resetIoFields = function (socket, msg) {
	var clean = {};
	var sender = cpy(msg.senderTiddler);

	if (sender.title === 'project') {
		sender.ioResult = `Reset of pocket-io fields is not allowed on the 'Project Managment' tiddler. They are required for it to work.`
		msg.resultTiddlers.push(sender);
		return msg;
	}

	for (const key in sender) {
		if (/^io/.test(key)) {
			continue;
		}
		clean[key] = sender[key];
	}

	msg.resultTiddlers.push(clean);
	return msg;
}
