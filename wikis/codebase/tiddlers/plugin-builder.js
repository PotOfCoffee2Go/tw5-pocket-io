$tpi.topic.pluginBuilder = function pluginBuilder(socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var pluginTitle = senderTid.ioPluginSelected;

	if (msg.req.wikiName === 'codebase') {
		senderTid.ioResult = $tpi.fn.formatIoResult(`'codebase' not allowed to repack`);
		msg.resultTiddlers.push(senderTid);
		return msg;
	}
	if (!$tw.wiki.tiddlerExists(pluginTitle)) {
		senderTid.ioResult = $tpi.fn.formatIoResult(`${senderTid.ioPluginSelected} not found`);
		msg.resultTiddlers.push(senderTid);
		return msg;
	}


}