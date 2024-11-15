// Create a project
// Verify input - calls projectUpdate to create project
function projectCreate(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var codeName = senderTid.ioPrjCodename;

	if ($cw.wiki.tiddlerExists(`${project}`)) {
		senderTid.ioResult = `Project '${project}' already exists in $code wiki.`;
	}
	if ($cw.wiki.tiddlerExists(`${project}-${codeName}`)) {
		senderTid.ioResult = `Function '${project}-${codeName}' already exists in $code wiki.`;
	}

	// Return error
	if (senderTid.ioResult) {
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	// Have projectUpdate create the project
	return projectUpdate(socket, msg);
}

topics.projectCreate = projectCreate;
