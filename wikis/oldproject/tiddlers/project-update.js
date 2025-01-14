// Create a new project or a new tab for an existing project
//  If the tab already exists - exits with no action
//  If project already exists will create a new tab
//  If project does not exist - will be created containing a tab
$tpi.topic.projectUpdate = function projectUpdate(socket, msg) {
	function createFromFilter($tw, filter, project, tabName, tabType) {
		var titles = [];
		var json = get$tw('project').wiki.getTiddlersAsJson(filter);
		var text = json
			.replace(/\$\$\$project\$\$\$/g, project)
			.replace(/\$\$\$tab\$\$\$/g, tabName)
			.replace(/\$\$\$type\$\$\$/g, tabType);
		var tiddlers = get$tw('project').wiki.deserializeTiddlers(null,text,
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

	var senderTid = cpy(msg.senderTiddler);
	var resultMsg = '';
	senderTid.ioResult = '';

	var $tw = get$tw('project1'); // get$tw(msg.req.wikiName);
	var project = senderTid.ioPrjProject;
	var tabName = senderTid.ioPrjTabName;
	var tabType = senderTid.ioPrjTabType;
	if (!tabName) {
		tabName = 'default';
	}
	if (!tabType) {
		tabType = 'code';
	}
	if (!project) {
		resultMsg = 'A project name is required.';
	}
	else if ($tw.wiki.tiddlerExists(`${project}-${tabName}-${tabType}`)) {
		resultMsg = `Tab '[[${project}-${tabName}-${tabType}]]' already exists!`;
	}

	// Return if error
	if (resultMsg) {
		senderTid.ioResult = $tpi.fn.formatIoResult(resultMsg);
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	var filter;
	if ($tw.wiki.tiddlerExists(project)) {
		filter = `[[$$$project$$$-${tabType}-$$$tab$$$]]`; // Tab
	} else {
		filter = '[[$$$project$$$]]'; // Project
	}

	var titles = createFromFilter($tw, filter, project, tabName, tabType);

	// Clear tabName (and project when create) on success
	senderTid.ioPrjTabName = '';
	if (msg.req.topic === 'projectCreate') {
		senderTid.ioPrjProject = '';
	}
	senderTid.ioResult = $tpi.fn.formatIoResult(`Tiddlers created:\n\n${titles.join(', ')}`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}
