// Create a new tab set
$tpi.topic.projectCreateTabSet = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var errorMsg = '';
	sender.ioResult = '';

	var dstWikiName = msg.req.wikiName;
	var project = sender.ioPrjProject;
	var tabSetType = sender.ioPrjTabSetType;
	var pillTitle = sender.ioPrjPillTitle;
	var tabSetTitle = `$:/poc2go/pocket-io/project/ui/Tag${tabSetType}`;
	var tabSetText = get$twCodebase.wiki.getTiddlerText('$:/poc2go/pocket-io/project/ui/Tagdocs');

	var $tw = get$tw(dstWikiName);

	if (!$tw) {
		errorMsg = `Error: Wiki '${dstWikiName}' is not in the Pocket-io network.`;
	}
	else if (!tabSetType) {
		errorMsg = 'Error: A tab set type is required.';
	}
	else if (!project) {
		errorMsg = 'Error: A project name is required.';
	}
	else if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(tabSetType)) {
		errorMsg = `Error: Tab type may only contain letters, numbers, dollar-sign, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n`;
	}
	else if ($tw.wiki.tiddlerExists(tabSetTitle)) {
		errorMsg = `Error: Tab set ${tabSetTitle} already exists!`;
	}

	// Return if error
	if (errorMsg) {
		sender.ioResult = errorMsg;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var newTabSet = {
		title: tabSetTitle,
		tags: '$:/tags/pocket-io/tabtype',
		caption: pillTitle,
		text: tabSetText.replace('tag="Docs"', `tag="${pillTitle}"`),
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
	
	sender.ioPrjTabSetType = '';
	sender.ioPrjPillTitle = '';
	sender.ioResult = `Created tab set '${pillTitle}'`;
	msg.resultTiddlers.push(sender);
	$tpi.fn.io.refreshClients(dstWikiName);
	return msg;
}
