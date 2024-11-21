// Create a new project or a new tab for an existing project
//  If the tab already exists - exits with no action
//  If project already exists will create a new tab
//  If project does not exist - will be created containing a tab

function projectFromFilter(filter, project, tabName) {
	var titles = [];
	var json = $cw.wiki.getTiddlersAsJson(filter);
	var text = json
		.replace(/\$\$\$project\$\$\$/g, project)
		.replace(/\$\$\$helpers\$\$\$/g, tabName);
	var tiddlers = $cw.wiki.deserializeTiddlers(null,text,
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

function projectUpdate(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	var resultMsg = '';
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var tabName = senderTid.ioPrjTabName;

	if (!(project && tabName)) {
		resultMsg = 'A project and tab name are required.';
	}
	else if ($cw.wiki.tiddlerExists(`${project}-${tabName}`)) {
		resultMsg = `Tab '[[${project}-${tabName}]]' already exists!`;
	}

	// Return if error
	if (resultMsg) {
		senderTid.ioResult = formatIoResult(resultMsg);
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	var filter;
	if ($cw.wiki.tiddlerExists(project)) {
		filter = '[prefix[$$$project$$$-$$$helpers$$$]]'; // Tab
	} else {
		filter = '[prefix[$$$project$$$]]'; // Project
	}
	
	var titles = projectFromFilter(filter, project, tabName);
	
	senderTid.ioResult = formatIoResult(`Tiddlers created:\n\n${titles.join(', ')}`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}

topics.projectUpdate = projectUpdate;
