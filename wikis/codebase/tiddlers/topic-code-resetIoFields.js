// Remove fields that begin with 'io'
$tpi.topic.resetIoFields = function (socket, msg) {
	var clean = {};
	var sender = cpy(msg.senderTiddler);
	// If sender is not a project tiddler
	if (!sender.autoLoad) {
		for (const key in sender) {
			if (!/^io/.test(key)) {
				clean[key] = sender[key];
			}
		}
		msg.resultTiddlers.push(clean);
	} else {
		msg.resultTiddlers.push(sender);
	}		
	return msg;
}
