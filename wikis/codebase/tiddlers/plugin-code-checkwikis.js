$tpi.topic.pluginCheckWikis = function pluginCheckWikis(socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var fakeTw = { wiki: { filterTiddlers: () => '' } };
	var $src = get$tw(senderTid.ioSrcPluginWiki) ?? fakeTw;
	var $dst = get$tw(senderTid.ioDstPluginWiki) ?? fakeTw;
	var $prj = get$tw(senderTid.ioSrcProjectWiki) ?? fakeTw;

	var wikisTiddler = '$:/temp/pocket-io/plugin/wikis';
	var pluginQuery = '[plugin-type[plugin]]';
	var srcPlugins = $src.wiki.filterTiddlers(pluginQuery);
	var dstPlugins = $dst.wiki.filterTiddlers(pluginQuery);

	var projectQuery = '[tag[Projects]]';
	var srcProjects = $prj.wiki.filterTiddlers(projectQuery);
	
	
	msg.resultTiddlers.push({
		title: wikisTiddler,
		text: '',
		ioSrcPlugins: $rw.utils.stringifyList(srcPlugins),
		ioDstPlugins: $rw.utils.stringifyList(dstPlugins),
		ioSrcProjects: $rw.utils.stringifyList(srcProjects),
	});

	// Display on console
	// dir(msg.resultTiddlers[0]);
	
	// Display on client - {{!!ioResult}}
	var responseText = `see [[${wikisTiddler}]]`;
	senderTid.ioResult = responseText;
	msg.resultTiddlers.push(senderTid);
	return msg;
}