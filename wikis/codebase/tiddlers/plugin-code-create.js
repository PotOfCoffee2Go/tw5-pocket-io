$tpi.topic.pluginCreate = function (socket, msg) {
	var $tw = get$tw(msg.req.wikiName);
	var sender = cpy(msg.senderTiddler);
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

	var $prj = get$tw(sender.ioSrcProjectWiki);
	if (!$prj) {
		sender.ioHelp = 'Select Wiki with the project to make into a plugin.';
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var projectQuery = '[tag[Projects]]';
	var srcProjectList = $prj.wiki.filterTiddlers(projectQuery);
	var tiddlersQuery = sender.ioSrcProject ? `[tag[${sender.ioSrcProject}]]` : '[[]]';
	var srcTiddlerList = $prj.wiki.filterTiddlers(tiddlersQuery);
	var infoQuery = `[list[$:/pocket-io/${sender.ioSrcProject}/info]]`;
	var infoTiddlerNames = $prj.wiki.filterTiddlers(infoQuery);
	var infoTiddlers = [];
	infoTiddlerNames.forEach(name => {
		infoTiddlers.push(name.split('-').pop());
	})
	sender.ioSrcProjectList = $rw.utils.stringifyList(srcProjectList);
	sender.ioSrcTiddlerList = $rw.utils.stringifyList(srcTiddlerList);
	sender.ioList = $rw.utils.stringifyList(infoTiddlers);

	sender.ioType = 'application/json';
	sender.ioVersion = sender.ioVersion || '0.0.0';
	sender.ioPluginPriority = '20';

	if (!sender.ioSrcProject) {
		sender.ioDisplayButtons = `<<resetAllButton>>`;
		sender.ioHelp = 'Select the project to make into a plugin.';
		msg.resultTiddlers.push(sender);
		return msg;
	}
/*
	if (!sender.ioName) {
		sender.ioError = 'Plugin Name is required';
		msg.resultTiddlers.push(sender);
		return msg;
	}
	if (!sender.ioPublisher) {
		sender.ioError = 'Plugin Publisher is required';
		msg.resultTiddlers.push(sender);
		return msg;
	}
*/
	var system = sender.ioSystem;
	var name = sender.ioName;
	var publisher = sender.ioPublisher;
	sender.ioTitle = `$:/plugins/${publisher}/${system}/${name}`.replace(/\/\//g, '/');
	sender.ioText = JSON.stringify({tiddlers:{}});
	sender.ioPluginType = 'plugin';

	// Display on client - {{!!ioResult}}
//	var responseText = `see [[${projectTiddler}]]`;
//	sender.ioResult = responseText;
	sender.ioDisplayButtons = '<<resetAllButton>> <<createButton>> <<builderButton>>';
	sender.ioHelp = `Make any changes and 'Update'<br>Press 'Build' to create the plugin`;
	msg.resultTiddlers.push(sender);
	return msg;

}
