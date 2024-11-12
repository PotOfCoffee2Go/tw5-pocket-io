// Create a new project or a new function for an existing project
//  If the function already exists - exits with no action
//  If project already exists will create a new function
//  If project does not exist - will be created containing given function name
function projectUpdate(project, fnName) {
	var filter = '';
	if (!(project && fnName)) {
		return 'A project and function name are required!\n' +
			'newProjectTiddlers(project, fnName)\n'
	}
	if ($cw.wiki.tiddlerExists(`${project}-${fnName}`)) {
		return `Function '${project}-${fnName}' already exists in $code wiki.\n`;
	}
	var filter, action;
	if ($cw.wiki.tiddlerExists(project)) {
		filter = '[[new-function.json]]';
		action = 'new function for project';
	} else {
		filter = '[[new-project.json]]';
		action = 'new project';
	}
	
	var parser = $cw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');
	var tidCount = 0;
	log(hue(`Creating ${action} '${project}' function '${fnName}' ...`, 149));
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
			.replace(/hhelperss/g, fnName);
		var tiddlers = $tw.utils.parseJSONSafe(newJsonTiddlers,[]);
		tiddlers.forEach(tiddler => {
			$cw.wiki.addTiddler(new $cw.Tiddler(
				$cw.wiki.getCreationFields(),
				tiddler,
				$cw.wiki.getModificationFields(),
			))
		})
		tidCount += tiddlers.length;
	})
	var result = `${tidCount} tiddlers updated on $code wiki`;
	log(hue(result, 149));
	return result;
}
