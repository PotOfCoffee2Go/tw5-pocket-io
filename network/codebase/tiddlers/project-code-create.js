// Create a project
// Verify input and build project from $$$project$$$ template
$tpi.topic.projectCreate = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var errorMsg = '';
	sender.ioResult = '';

	var dstWikiName = sender.ioPrjWiki;
	var project = sender.ioPrjProject;
	var $tw = get$tw(dstWikiName); // destination wiki

	if (!dstWikiName) {
		errorMsg = `Error: Wiki name is required`;
	}
	else if (!project) {
		errorMsg = `Error: Project name is required`;
	}
	else if (!$tw) {
		errorMsg = `Error: Wiki '${dstWikiName}' is not in the Pocket-io network.`;
	}
	else if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(project)) {
		errorMsg = `Error: Project name may only contain letters, numbers, dollar-sign, underbars, and dashes\n\n` +
			`Notably spaces and special characters are not allowed.\n\n` +
			`Once created can change the 'caption' field to display as desired.`;
	}
	else if ($tw.wiki.tiddlerExists(project)) {
		errorMsg = `Error: Project '${project}' already exists in wiki '${dstWikiName}'!`;
	}

	// Return error
	if (errorMsg) {
		sender.ioResult = errorMsg;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	// Get the project template and replace occurances of $$$project$$
	//  with the project name
	var json = $twCodebase.wiki.getTiddlersAsJson('[[$$$project$$$]]');
	var text = json.replace(/\$\$\$project\$\$\$/g, project);
	var tiddlers = $tw.wiki.deserializeTiddlers(null,text,
		{title: 'unused'}, {deserializer: 'application/json'});

	// Add the project tiddler to the destination wiki
	var tiddler = tiddlers[0];
	$tw.wiki.addTiddler(new $tw.Tiddler(
		tiddler,
		$tw.wiki.getCreationFields(),
		$tw.wiki.getModificationFields()
	))

	// Return successful
	var link = get$proxy(dstWikiName).link;
	sender.ioResult = `Project created - ${link}/#${project}`;
	msg.resultTiddlers.push(sender);

	// Tell all clients connected to destination wiki to refresh
	$refreshClients(dstWikiName);
	return msg;
}
