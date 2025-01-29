// Create a new project or a new tab for an existing project
//  If the tab already exists - exits with no action
//  If project already exists will create a new tab
//  If project does not exist - will be created containing a tab
$tpi.fn.projectCreateFromFilter = function projectCreateFromFilter(filter, project, tabName, $cw) {
	var titles = [];
	var json = get$tw('codebase').wiki.getTiddlersAsJson(filter);
	var text = json
		.replace(/\$\$\$project\$\$\$/g, project)
		.replace(/\$\$\$tab\$\$\$/g, tabName);
	var tiddlers = get$tw('codebase').wiki.deserializeTiddlers(null,text,
		{title: 'unused'},
		{deserializer: 'application/json'});
	$cw.utils.each(tiddlers, (tiddler) => {
		$cw.wiki.addTiddler(new $cw.Tiddler(
			tiddler,
			$cw.wiki.getCreationFields(),
			$cw.wiki.getModificationFields()
		))
		titles.push(`[[${tiddler.title}]]`);
	});
	return titles;
}

$tpi.topic.projectUpdate = function projectUpdate(socket, msg) {
	var $cw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	var resultMsg = '';
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var tabName = senderTid.ioPrjTabName;
	if (!tabName) {
		tabName = 'default';
	}
	if (!project) {
		resultMsg = 'A project name is required.';
	}
	else if ($cw.wiki.tiddlerExists(`${project}-${tabName}`)) {
		resultMsg = `Tab '[[${project}-${tabName}]]' already exists!`;
	}

	// Return if error
	if (resultMsg) {
		senderTid.ioResult = $tpi.fn.formatIoResult(resultMsg);
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	var filter;
	if ($cw.wiki.tiddlerExists(project)) {
		filter = '[prefix[$$$project$$$-$$$tab$$$]]'; // Tab
	} else {
		filter = '[prefix[$$$project$$$]]'; // Project
	}

	var titles = $tpi.fn.projectCreateFromFilter(filter, project, tabName, $cw);

	// Clear tabName (and project when create) on success
	senderTid.ioPrjTabName = '';
	if (msg.req.topic === 'projectCreate') {
		senderTid.ioPrjProject = '';
	}
	senderTid.ioResult = $tpi.fn.formatIoResult(`Tiddlers created:\n\n${titles.join(', ')}`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}
