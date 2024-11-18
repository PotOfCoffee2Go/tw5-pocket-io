// Create a new project or a new function for an existing project
//  If the function already exists - exits with no action
//  If project already exists will create a new function
//  If project does not exist - will be created containing given function name
function projectUpdate(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var tabName = senderTid.ioPrjTabName;

	if (!(project && tabName)) {
		senderTid.ioResult = 'A project and tab name are required.';
	}
	else if ($cw.wiki.tiddlerExists(`${project}-${tabName}`)) {
		senderTid.ioResult = `Tab '[[${project}-${tabName}]]' @@already exists!@@`;
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
	
	var titles = [];
	var parser = $cw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');
	log(hue(`Creating ${action} '${project}' function '${tabName}'`, 149));
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
			.replace(/hhelperss/g, tabName);
		var tiddlers = $cw.utils.parseJSONSafe(newJsonTiddlers,[]);
		tiddlers.forEach(tiddler => {
			$cw.wiki.addTiddler(new $cw.Tiddler(
				$cw.wiki.getCreationFields(),
				tiddler,
				$cw.wiki.getModificationFields(),
			))
			titles.push(`[[${tiddler.title}]]`);
		})
	})
	
	senderTid.ioResult = `Tiddlers created:\n${titles.join(', ')}`;
	msg.resultTiddlers.push(senderTid);
//	log(hue(result, 149));
	return msg;
}

topics.projectUpdate = projectUpdate;
