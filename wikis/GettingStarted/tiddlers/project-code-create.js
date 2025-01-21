// Create a project
// Verify input - calls projectUpdate to create project
$tpi.topic.projectCreate = function projectCreate(socket, msg) {
	var $cw = get$tw(msg.req.wikiName);
	var sender = cpy(msg.senderTiddler);
	var resultMsg = '';
	sender.ioResult = '';

	var project = sender.ioPrjProject;
	var tabName = sender.ioPrjTabName;

	if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(project)) {
		resultMsg = `Project name may only contain letters, numbers, dollar-sign, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n\n` +
			`Once created can change the 'caption' field to display as desired.`;
	}
	else if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(tabName)) {
		resultMsg = `Tab name may only contain letters, numbers, dollar-sign, underbars, and dashes\n\n` +
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
		sender.ioResult = $tpi.fn.formatIoResult(resultMsg);
		msg.resultTiddlers.push(sender);
		return msg;
	}

	// Have projectUpdate create the project
	return $tpi.topic.projectUpdate(socket, msg);
}
