// Create a plugin
$tpi.topic.pluginCreate = function pluginCreate(socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var pluginTiddler = '$:/plugins/$$$author$$$/$$$pluginname$$$'
		.replace('$$$author$$$', senderTid.ioPluginAuthor)
		.replace('$$$pluginname$$$', senderTid.ioPluginName)
	
	if (!$tw.wiki.tiddlerExists(pluginTiddler)) {
		$rw.wiki.addTiddler(new $rw.Tiddler({
				title: pluginTiddler,
				dependents:	'',
				description:'',
				name: senderTid.ioPluginName,
				'plugin-type': 'plugin',
				type: 'application/json',
				version: '0.0.1',
				text: `{"tiddlers": {}}`
		}))
	} else {
		senderTid.ioResult = $tpi.fn.formatIoResult(`${pluginTiddler} already exists`);
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	var tiddlersJson = $tw.wiki.getTiddlersAsJson(senderTid.ioPluginFilter);

	var titles = [];
	var tiddlers = $rw.wiki.deserializeTiddlers(null, tiddlersJson,
		{title: 'unused'}, {deserializer: 'application/json'});
	$rw.utils.each(tiddlers, (tiddler) => {
		$rw.wiki.addTiddler(new $rw.Tiddler(
			tiddler,
			$rw.wiki.getCreationFields(),
			$rw.wiki.getModificationFields()
		))
		titles.push(tiddler.title);
		// send system tiddlers to client via sockets
		if (/^\$:\//.test(tiddler.title)) {
			msg.resultTiddlers.push(tiddler);
		}
	});

	$rw.utils.repackPlugin(pluginTiddler, titles);

	msg.resultTiddlers.push(JSON.parse($rw.wiki.getTiddlerAsJson(pluginTiddler)));

	senderTid.ioResult = $tpi.fn.formatIoResult(`Done`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}
