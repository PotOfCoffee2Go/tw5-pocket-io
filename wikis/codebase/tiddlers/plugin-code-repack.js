// Repack a plugin
$tpi.topic.pluginRepack = function pluginRepack(socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var pluginTitle = senderTid.ioPluginSelected;

	if (msg.req.wikiName === 'codebase') {
		senderTid.ioResult = `'codebase' not allowed to repack`;
		msg.resultTiddlers.push(senderTid);
		return msg;
	}
	if (!$tw.wiki.tiddlerExists(pluginTitle)) {
		senderTid.ioResult = `${senderTid.ioPluginSelected} NOT FOUNd`;
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	var tiddlersJson = $tw.wiki.getTiddlersAsJson(senderTid.ioPluginFilter);

	var titles = [];
	var tiddlers = $rw.wiki.deserializeTiddlers(null, tiddlersJson,
		{title: 'unused'}, {deserializer: 'application/json'});
	$rw.utils.each(tiddlers, (tiddler) => {
		$rw.wiki.addTiddler(new $rw.Tiddler(tiddler));
		titles.push(tiddler.title);
	});

	$rw.wiki.addTiddler(new $rw.Tiddler(JSON.parse($tw.wiki.getTiddlerAsJson(pluginTitle))));
	$rw.utils.repackPlugin(pluginTitle, titles);
	msg.resultTiddlers.push(JSON.parse($rw.wiki.getTiddlerAsJson(pluginTitle)));
	
	titles.forEach(title => $rw.wiki.deleteTiddler(title));
	$rw.wiki.deleteTiddler(pluginTitle);
	
	senderTid.ioResult = `Done`;
	msg.resultTiddlers.push(senderTid);
	msg.req.tostory = true;
	return msg;
}
