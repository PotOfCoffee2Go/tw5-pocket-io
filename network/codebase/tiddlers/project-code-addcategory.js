// Create a new category
$tpi.topic.projectAddCategory = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var errorMsg = '';
	sender.ioResult = '';

	var dstWikiName = msg.req.wikiName;
	var project = sender.ioPrjProject;
	var tabSetType = sender.ioPrjCategoryType;
	var pillTitle = sender.ioPrjCategoryPillTitle;
	var tabSetTitle = `$:/pocket-io/project/ui/Tab${tabSetType}`;
	var tabSetText = `<<categoryPill '${pillTitle}'>>`;

	var $tw = get$tw(dstWikiName);

	if (!$tw) {
		errorMsg = `Error: Wiki '${dstWikiName}' is not in the Pocket-io network.`;
	}
	else if (!tabSetType) {
		errorMsg = 'Error: A category type is required.';
	}
	else if (!project) {
		errorMsg = 'Error: A project name is required.';
	}
	else if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(tabSetType)) {
		errorMsg = `Error: Tab type may only contain letters, numbers, dollar-sign, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n`;
	}
	else if ($tw.wiki.tiddlerExists(tabSetTitle)) {
		errorMsg = `Error: Category ${tabSetTitle} already exists!`;
	}

	// Return if error
	if (errorMsg) {
		sender.ioResult = errorMsg;
		msg.resultTiddlers.push(sender);
		return msg;
	}
	var broadcast = dstWikiName === 'codebase' ? ' $:/tags/pocket-io/broadcast' : '';
	
	var newTabSet = {
		title: tabSetTitle,
		tags: '$:/tags/pocket-io/tabtype' + broadcast,
		caption: pillTitle,
		text: tabSetText,
		type: 'text/vnd.tiddlywiki',
		tabtype: tabSetType
	};
/*
	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getCreationFields(),
		newTabSet,
		$tw.wiki.getModificationFields(),
	))
*/
	msg.resultTiddlers.push(newTabSet);
	
	sender.ioPrjCategoryType = '';
	sender.ioPrjCategoryPillTitle = '';
	sender.ioResult = `Created category '${pillTitle}' of type '${tabSetType}'`;
	msg.resultTiddlers.push(sender);
	$refreshClients(dstWikiName);
	return msg;
}
