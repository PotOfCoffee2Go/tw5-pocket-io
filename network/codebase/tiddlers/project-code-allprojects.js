// Create/update '$:/pocket-io/system/projects' with list of all projects
$tpi.topic.projectNetworkTable = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	sender.ioResult = '';

	var tableTemplate = '|tc-center|k\n| Domain | Wiki | Project | AutoLoad <br> Code |h\n';
	var origin = msg.req.info['$:/info/url/origin'].text;
	$ss.forEach(settings => {
		var wikiName = settings.name;
		if (get$server(wikiName).isPublic === false && $config.hidePrivateWikis) { return; }
		var originName = origin === get$server(wikiName).localName ? get$server(wikiName).localName : 'Internet';
		var wikiLink = `${origin}/${wikiName}`;
		var $tw = get$tw(wikiName);

		tableTemplate += `|${originName}|[[${wikiName}|${wikiLink}]] |<|<|\n`;
		$tw.wiki.filterTiddlers('[tag[Projects]]').forEach(project => {
			if (/^\$\$\$/.test(project)) { return; } // continue next forEach
			var tiddler = JSON.parse($tw.wiki.getTiddlerAsJson(project));
			tableTemplate += `| |<|[[${project}|${wikiLink}/#${project}]] ` +
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
