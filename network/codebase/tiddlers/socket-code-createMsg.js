// Message
$tpi.fn.io.createMessage = function createMessage($tw, topic, sender, filter='[]') {
	var msg = {
		req: { command: 'emit', topic, filter, sender },
		senderTiddler: $tw.utils.parseJSONSafe($tw.wiki.getTiddlerAsJson(sender),{}),
		filterTiddlers: $tw.utils.parseJSONSafe($tw.wiki.getTiddlersAsJson(filter),[]),
		resultTiddlers: []
	}
	return msg;
}
