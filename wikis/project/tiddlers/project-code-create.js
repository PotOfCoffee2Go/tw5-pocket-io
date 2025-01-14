// Create a project
// Verify input - calls projectUpdate to create project
$tpi.topic.projectCreate = function projectCreate(socket, msg) {
	var $cw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	var resultMsg = '';
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var tabName = senderTid.ioPrjTabName;

	if (!/^[\w-]+$/.test(project)) {
		resultMsg = `Project name may only contain letters, numbers, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n\n` +
			`Once created can change the 'caption' field to display as desired.`;
	}
	else if (!/^[\w-]+$/.test(tabName)) {
		resultMsg = `Tab name may only contain letters, numbers, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n\n` +
			`Once created can change the 'caption' field to display as desired.`;
	}
	else if ($cw.wiki.tiddlerExists(`${project}`)) {
		resultMsg = `Project '[[${project}]]' already exists!`;
	}
	else if ($cw.wiki.tiddlerExists(`${project}-${tabName}`)) {
		resultMsg = `Project tab '[[${project}-${tabName}]]' already exists!`;
	}

	// Return error
	if (resultMsg) {
		senderTid.ioResult = $tpi.fn.formatIoResult(resultMsg);
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	// Have projectUpdate create the project
	return $tpi.topic.projectUpdate(socket, msg);
}