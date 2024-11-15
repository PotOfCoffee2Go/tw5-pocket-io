// Create a new project or a new function for an existing project
//  If the function already exists - exits with no action
//  If project already exists will create a new function
//  If project does not exist - will be created containing given function name
function projectUpdate(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var codeName = senderTid.ioPrjCodename;

	if (!(project && codeName)) {
		senderTid.ioResult = 'A project and function name are required.';
	}
	else if ($cw.wiki.tiddlerExists(`${project}-${codeName}`)) {
		senderTid.ioResult = `Function '${project}-${codeName}' already exists in $code wiki.`;
	}

	if (senderTid.ioResult) {
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	var filter, action;
	if ($cw.wiki.tiddlerExists(project)) {
		filter = '[[new-function.json]]';
		action = 'new function for project';
	} else {
		filter = '[[new-project.json]]';
		action = 'new project';
	}
	
	var tidCount = 0;
	var parser = $cw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');
	log(hue(`Creating ${action} '${project}' function '${codeName}'`, 149));
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		var widgetNode = $cw.wiki.makeWidget(parser,
			{variables: $cw.utils.extend({},
				{currentTiddler: title, storyTiddler: title})
			}
		);
		var container = $cw.fakeDocument.createElement("div");
		widgetNode.render(container,null);
		var tiddlerText = container.textContent;
		var newJsonTiddlers = tiddlerText
			.replace(/pprojectt/g, project)
			.replace(/hhelperss/g, codeName);
		var tiddlers = $cw.utils.parseJSONSafe(newJsonTiddlers,[]);
		tiddlers.forEach(tiddler => {
			$cw.wiki.addTiddler(new $cw.Tiddler(
				$cw.wiki.getCreationFields(),
				tiddler,
				$cw.wiki.getModificationFields(),
			))
		})
		tidCount += tiddlers.length;
	})
	
	senderTid.ioResult = `${tidCount} tiddlers updated on $code wiki.`;
	msg.resultTiddlers.push(senderTid);
//	log(hue(result, 149));
	return msg;
}

topics.projectUpdate = projectUpdate;
