$tpi.topic.pluginResetAll = function (socket, msg) {
	var clean = {};
	var sender = cpy(msg.senderTiddler);
	for (const key in sender) {
		if (!/^io/.test(key)) {
			clean[key] = sender[key];
		}
	}
	msg.resultTiddlers.push(clean);
	return msg;
}

$tpi.topic.pluginCreate = function (socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var sender = cpy(msg.senderTiddler);
	sender.ioError = '';
	sender.ioResult = '';

	if (!sender.ioName && sender.ioSrcProject) {
		sender.ioName = sender.ioSrcProject;
	}
	if (!sender.ioSystem && sender.ioSrcProjectWiki) {
		sender.ioSystem = sender.ioSrcProjectWiki;
	}
	if (!sender.ioPublisher) {
		var userName = msg.filterTiddlers.find(({ title }) => title === "$:/status/UserName");
		sender.ioAuthor = userName ? userName.text : '';
		sender.ioPublisher = userName ? userName.text : '';
	}
	
	var fakeTw = { wiki: { filterTiddlers: () => '' } };
	var $prj = get$tw(sender.ioSrcProjectWiki) ?? fakeTw;

	var projectQuery = '[tag[Projects]]';
	var srcProjectList = $prj.wiki.filterTiddlers(projectQuery);
	var tiddlersQuery = sender.ioSrcProject ? `[tag[${sender.ioSrcProject}]]` : '[[]]';
	var srcTiddlerList = $prj.wiki.filterTiddlers(tiddlersQuery);

	sender.ioSrcProjectList = $rw.utils.stringifyList(srcProjectList);
	sender.ioSrcTiddlerList = $rw.utils.stringifyList(srcTiddlerList);

	sender.ioType = 'application/json';
	sender.ioVersion = sender.ioVersion || '0.0.0';

	if (!sender.ioSrcProject) {
		sender.ioDisplayButtons = '<<resetAllButton>>';
		msg.resultTiddlers.push(sender);
		return msg;
	}

	if (!sender.ioName) {
		sender.ioError = $tpi.fn.formatIoError('Plugin Name is required');
		msg.resultTiddlers.push(sender);
		return msg;
	}
	if (!sender.ioPublisher) {
		sender.ioError = $tpi.fn.formatIoError('Plugin Publisher is required');
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var system = sender.ioSystem;
	var name = sender.ioName;
	var publisher = sender.ioPublisher;
	sender.ioTitle = `$:/plugins/${publisher}/${system}/${name}`.replace(/\/\//g, '/');
	sender.ioText = JSON.stringify(srcTiddlerList);
	sender.ioPluginType = 'plugin';

	// Display on client - {{!!ioResult}}
//	var responseText = `see [[${projectTiddler}]]`;
//	sender.ioResult = $tpi.fn.formatIoResult(responseText);
	sender.ioDisplayButtons = '<<resetAllButton>> <<generateButton>> <<buildButton>>';
	msg.resultTiddlers.push(sender);
	return msg;

}
