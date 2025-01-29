// Create a new project or a new tab for an existing project
//  If the tab already exists - exits with no action
//  If project already exists will create a new tab
//  If project does not exist - will be created containing a tab
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
		tabName = 'default';
	}
	if (!tabType) {
		tabType = 'code';
	}
	if (!project) {
		resultMsg = 'A project name is required.';
	}
	else if (!dstWiki) {
		resultMsg = 'A destination wiki (On Wiki) name is required.';
	}
	else if ($tw.wiki.tiddlerExists(`${project}-${tabType}-${tabName}`)) {
		resultMsg = `Tab '[[${project}-${tabType}-${tabName}]]' already exists!`;
	}

	// Return if error
	if (resultMsg) {
		sender.ioResult = $tpi.fn.formatIoResult(resultMsg);
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
//	sender.ioResult = $tpi.fn.formatIoResult(`Tiddler created : ${newTab.title}`);
	msg.resultTiddlers.push(sender);
	setTimeout(() => { $tpi.fn.io.refreshClients(dstWiki); }, 1000);
	return msg;
}
