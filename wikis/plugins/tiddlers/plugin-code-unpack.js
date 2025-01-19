$tpi.topic.pluginUnpack = function pluginUnpack(socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';
	
	var pluginData = $tw.wiki.getTiddlerDataCached(senderTid.ioPluginSelected);
	if (!pluginData) {
		senderTid.ioResult = $tpi.fn.formatIoResult(`Plugin '${senderTid.ioPluginSelected}' not found`);
	} else {
		$tw.utils.each(pluginData.tiddlers,function(tiddler) {
			$tw.wiki.addTiddler(new $tw.Tiddler(tiddler));
			// system tiddlers will be sent via socket
			if (/^\$:\//.test(tiddler.title)) {
				msg.resultTiddlers.push(tiddler);
			}
		});
		senderTid.ioResult = $tpi.fn.formatIoResult(`Plugin '${senderTid.ioPluginSelected}' unpacked`);
	}

	msg.resultTiddlers.push(senderTid);
	return msg;
}
