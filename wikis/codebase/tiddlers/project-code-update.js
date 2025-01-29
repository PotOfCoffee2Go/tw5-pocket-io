// Create a new project or a new tab for an existing project
//  If the tab already exists - exits with no action
//  If project already exists will create a new tab
//  If project does not exist - will be created containing a tab
$tpi.topic.projectUpdate = function projectUpdate(socket, msg) {
	function createFromFilter($tw, filter, project, tabName, tabType) {
		var titles = [];
		var json = get$tw('codebase').wiki.getTiddlersAsJson(filter);
		var text = json
			.replace(/\$\$\$project\$\$\$/g, project)
			.replace(/\$\$\$tab\$\$\$/g, tabName)
			.replace(/\$\$\$type\$\$\$/g, tabType);
		var tiddlers = get$tw('codebase').wiki.deserializeTiddlers(null,text,
			{title: 'unused'},
			{deserializer: 'application/json'});
		$tw.utils.each(tiddlers, (tiddler) => {
			$tw.wiki.addTiddler(new $tw.Tiddler(
				tiddler,
				$tw.wiki.getCreationFields(),
				$tw.wiki.getModificationFields()
			))
			titles.push(`[[${tiddler.title}]]`);
		});
		return titles;
	}

	var sender = cpy(msg.senderTiddler);
	var resultMsg = '';
	sender.ioResult = '';

	var dstWiki = sender.ioPrjWiki;
	var project = sender.ioPrjProject;
	var tabName = sender.ioPrjTabName;
	var tabType = sender.ioPrjTabType;
	var $tw = get$tw(dstWiki); // get$tw(msg.req.wikiName);
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

	var filter;
	if ($tw.wiki.tiddlerExists(project)) {
		filter = `[[$$$project$$$-${tabType}-$$$tab$$$]]`; // Tab
	} else {
		filter = '[[$$$project$$$]]'; // Project
	}

	var titles = createFromFilter($tw, filter, project, tabName, tabType);

	sender.ioPrjTabName = '';
	sender.ioResult = $tpi.fn.formatIoResult(`Tiddlers created:\n\n${titles.join(', ')}`);
	msg.resultTiddlers.push(sender);
	$tpi.fn.io.refreshClients(dstWiki);
	return msg;
}
