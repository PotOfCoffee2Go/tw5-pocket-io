// Message
$tpi.fn.io.createMessage = function createMessage($tw, topic, sender, filter='[]', tostory = false) {
	var msg = {
		req: { command: 'emit', topic, filter, sender, tostory },
		senderTiddler: $tw.utils.parseJSONSafe($tw.wiki.getTiddlerAsJson(sender),{}),
		filterTiddlers: $tw.utils.parseJSONSafe($tw.wiki.getTiddlersAsJson(filter),[]),
		resultTiddlers: []
	}
	return msg;
}
