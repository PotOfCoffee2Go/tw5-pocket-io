// Create a new project or a new tab for an existing project
//  If the tab already exists - exits with no action
//  If project already exists will create a new tab
$tpi.topic.projectUpdatetabs = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var resultMsg = '';
	sender.ioResult = '';

	var dstWiki = msg.req.wikiName;
	var project = sender.ioPrjProject;
	var tabName = sender.ioPrjTabName;
	var tabType = sender.ioPrjTabType;
	var $tw = get$tw(dstWiki);
	if (!tabName) {
		resultMsg = 'A tab name is required.';
	}
	else if (!tabType) {
		resultMsg = 'A tab type is required.';
	}
	else if (!project) {
		resultMsg = 'A project name is required.';
	}
	else if (!dstWiki) {
		resultMsg = 'A destination wiki name is required.';
	}
	else if ($tw.wiki.tiddlerExists(`${project}-${tabType}-${tabName}`)) {
		resultMsg = `Tab '[[${project}-${tabType}-${tabName}]]' already exists!`;
	}

	if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(tabName)) {
		resultMsg = `Tab name may only contain letters, numbers, dollar-sign, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n\n` +
			`Once created can change the 'caption' field to display as desired.`;
	}

	// Return if error
	if (resultMsg) {
		sender.ioResult = resultMsg;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var newTab = {
		title: `${project}-${tabType}-${tabName}`,
		tags: $tw.utils.stringifyList([tabType, project, `$:/pocket-io/${project}/${tabType}`]),
		caption: tabName,
		text: tabType === 'code' ? '// code goes here' : `${tabType} goes here`,
		type: tabType === 'code' ? 'application/javascript' : 'text/vnd.tiddlywiki'
	}

	msg.resultTiddlers.push(newTab);

	sender.ioPrjTabName = '';
//	sender.ioResult = `Tiddler created : ${newTab.title}`;
	msg.resultTiddlers.push(sender);
	setTimeout(() => { $tpi.fn.io.refreshClients(dstWiki); }, 1000);
	return msg;
}
