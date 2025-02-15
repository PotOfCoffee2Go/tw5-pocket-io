// Create a new tab for an existing project
//  If the tab already exists - exits with no action
//  If project already exists will create a new tab
$tpi.topic.projectUpdatetabs = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var errorMsg = '';
	sender.ioResult = '';

	var dstWikiName = sender.ioPrjWiki ?? msg.req.wikiName;
	var project = sender.ioPrjProject;
	var tabName = sender.ioPrjTabName;
	var tabType = sender.ioPrjTabType;
	
	var $tw = get$tw(dstWikiName);

	if (!$tw) {
		errorMsg = `Error: Wiki '${dstWikiName}' is not in the Pocket-io network.`;
	}
	else if (!tabName) {
		errorMsg = 'Error: A tab name is required.';
	}
	else if (!tabType) {
		errorMsg = 'Error: A tab type is required.';
	}
	else if (!project) {
		errorMsg = 'Error: A project name is required.';
	}
	else if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(tabName)) {
		errorMsg = `Error: Tab name may only contain letters, numbers, dollar-sign, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n\n` +
			`Once created can change the 'caption' field to display as desired.`;
	}
	else if ($tw.wiki.tiddlerExists(`${project}-${tabType}-${tabName}`)) {
		errorMsg = `Error: Tab '[[${project}-${tabType}-${tabName}]]' already exists!`;
	}

	// Return if error
	if (errorMsg) {
		sender.ioResult = errorMsg;
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
	// Return the new tab
	msg.resultTiddlers.push(newTab);

	sender.ioPrjTabName = '';
	msg.resultTiddlers.push(sender);
	$tpi.fn.io.refreshClients(dstWikiName);
	return msg;
}
