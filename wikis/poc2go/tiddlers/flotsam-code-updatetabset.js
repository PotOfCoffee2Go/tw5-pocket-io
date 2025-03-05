// Create a new tab set
$tpi.topic.projectUpdateTabSet = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var errorMsg = '';
	sender.ioResult = '';

	var dstWikiName = msg.req.wikiName;
	var project = sender.ioPrjProject;
	var tabSetName = sender.ioPrjTabSetName;
	var tabType = sender.ioPrjTabType;
	var pillTitle = sender.ioPrjPillTitle;
	var tabSetTitle = `pocket-io/project/ui/Tag${tabSetName}`;
	var tabSetText = get$twCodebase.wiki.getTiddlerText('$:/poc2go/pocket-io/project/ui/Tagdocs');

	var $tw = get$tw(dstWikiName);

	if (!$tw) {
		errorMsg = `Error: Wiki '${dstWikiName}' is not in the Pocket-io network.`;
	}
	else if (!tabSetName) {
		errorMsg = 'Error: A tab set name is required.';
	}
	else if (!tabType) {
		errorMsg = 'Error: A tab set type is required.';
	}
	else if (!project) {
		errorMsg = 'Error: A project name is required.';
	}
	else if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(tabSetName)) {
		errorMsg = `Error: Tab name may only contain letters, numbers, dollar-sign, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n\n` +
			`Once created can change the 'caption' field to display as desired.`;
	}
	else if ($tw.wiki.tiddlerExists(tabSetTitle)) {
		errorMsg = `Error: Tab ${tabSetTitle} already exists!`;
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
		tabtype: tabType
	};

	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getCreationFields(),
		newTabSet,
		$tw.wiki.getModificationFields(),
	))

	sender.ioPrjTabSetName = '';
	sender.ioPrjTabType = '';
	sender.ioPrjPillTitle = '';
	sender.ioResult = `Created tab set '${pillTitle}'`;
	msg.resultTiddlers.push(sender);
	$tpi.fn.io.refreshClients(dstWikiName);
	return msg;
}
