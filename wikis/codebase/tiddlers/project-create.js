// Create a project
// Verify input - calls projectUpdate to create project
function projectCreate(socket, msg) {
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
		senderTid.ioResult = formatIoResult(resultMsg);
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	// Have projectUpdate create the project
	return projectUpdate(socket, msg);
}

$topics.projectCreate = projectCreate;
