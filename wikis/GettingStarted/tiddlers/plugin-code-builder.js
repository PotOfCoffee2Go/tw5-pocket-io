$tpi.topic.pluginBuilder = function (socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var sender = cpy(msg.senderTiddler);
	sender.ioResult = '';

	var $from = get$tw(sender.ioSrcProjectWiki);

	// Copy plugin tiddlers to REPL tiddlywiki
	var tiddlersQuery = sender.ioSrcProject ? `[tag[${sender.ioSrcProject}]]` : '[[]]';
	var tiddlers = $from.utils.parseJSONSafe($from.wiki.getTiddlersAsJson(tiddlersQuery), []);
	tiddlers.forEach(tiddler => {
		$rw.wiki.addTiddler(new $rw.Tiddler(tiddler));
	})

	// Create plugin information (tabs) tiddlers
	var pluginInfoQuery = `[tag[${sender.ioSrcProject}]tag[info]]`; 
	var infoTiddlers = $from.utils.parseJSONSafe($from.wiki.getTiddlersAsJson(pluginInfoQuery), []);
	var names = [], infoTitles = [];
	infoTiddlers.forEach(tiddler => {
		var name = tiddler.title.split('/').pop().split('-').pop();
		names.push(name);
		tiddler.title = sender.ioTitle + '/' + name;
		infoTitles.push(tiddler.title);
		tiddler.tags = '';
		$rw.wiki.addTiddler(new $rw.Tiddler(tiddler));
	})

	// Add the plugin tiddler
	$rw.wiki.addTiddler(new $rw.Tiddler(
		$rw.wiki.getCreationFields(),
		{
			title: sender.ioTitle,
			dependents:	sender.ioDependents,
			description: sender.ioDescription,
			name: sender.ioName,
			'plugin-type': sender.ioPluginType,
			type: sender.ioType,
			version: sender.ioVersion,
			text: JSON.stringify({tiddlers: {}}),
			author: sender.ioAuthor,
			list: $rw.utils.stringifyList(names),
			'plugin-priority': sender.ioPluginPriority,
			'parent-plugin': sender.ioParentPlugin,
			stability: sender.ioStability,
			source: sender.ioSource
		},
		$rw.wiki.getModificationFields()
	));

	// Pack the plugin with the tiddlers
	var srcTiddlerList = $rw.wiki.filterTiddlers(`[tag[${sender.ioSrcProject}]] ${$rw.utils.stringifyList(infoTitles)}`);
	tog($rw.utils.repackPlugin(sender.ioTitle, srcTiddlerList));

	// Move plugin to destination wiki
	var packagedPlugin = JSON.parse($rw.wiki.getTiddlerAsJson(sender.ioTitle));
	var $to = get$tw(sender.ioDstPluginWiki);
	$to.wiki.addTiddler(new $to.Tiddler(packagedPlugin));
	$rw.wiki.deleteTiddler(sender.ioTitle);

//	$tpi.fn.io.refreshClients();

	var resultText = `Plugin tiddler '${packagedPlugin.title}' updated on wiki '${sender.ioDstPluginWiki}'`;
	sender.ioResult = $tpi.fn.formatIoResult(resultText);
	msg.resultTiddlers.push(sender);
	return msg;
}
