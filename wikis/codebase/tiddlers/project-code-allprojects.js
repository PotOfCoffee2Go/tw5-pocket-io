// Create/update '$:/pocket-io/system/projects' with list of all projects
$tpi.topic.projectAllProjects = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	sender.ioResult = '';

	var tableTemplate = '|tc-center|k\n| Wiki | Project | AutoLoad <br> Code |h\n';

	$ss.forEach(settings => {
		var wikiName = settings.name;
		var wikiLink = get$proxy(wikiName).link;
		var $tw = get$tw(wikiName);

		tableTemplate += `|[[${wikiName}|${wikiLink}]] | | |\n`;
		$tw.wiki.filterTiddlers('[tag[Projects]]').forEach(project => {
			if (/^\$\$\$/.test(project)) { return; } // continue next forEach
			var tiddler = JSON.parse($tw.wiki.getTiddlerAsJson(project));
			tableTemplate += `| |[[${project}|${wikiLink}/#${project}]] ` +
			`| ${tiddler.autoLoad === 'yes' ? 'yes' : 'no'} |\n`;
		})
	})

	var resultTiddler = {
		title: '$:/temp/pocket-io/system/projects',
		text: tableTemplate,
	}

	msg.resultTiddlers.push(resultTiddler);

	return msg;
}
