// Create a project
// Verify input - calls projectUpdate to create project
function projectCreate(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var tabName = senderTid.ioPrjTabName;

	if ($cw.wiki.tiddlerExists(`${project}`)) {
		senderTid.ioResult = `Project '[[${project}]]' @@already exists!@@`;
	}
	if ($cw.wiki.tiddlerExists(`${project}-${tabName}`)) {
		senderTid.ioResult = `Project tab '[[${project}-${tabName}]]' @@already exists!@@`;
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
