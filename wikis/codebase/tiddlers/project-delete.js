// Delete a project's code or a project completely
function projectDelete(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var codeName = senderTid.ioPrjCodename;

	if (!(project && codeName)) {
		senderTid.ioResult = 'A project and function name are required! ' +
			`Use codeName '!!!delete all!!!' to remove project.`;
		msg.resultTiddlers.push(senderTid);
		return msg;
	}
	var filter, action;
	if (codeName === '!!!delete all!!!') {
		filter = `[tag[${project}]]`;
		action = `Delete project '${project}'.`;
	} else {
		if (!$cw.wiki.tiddlerExists(`${project}-${codeName}`)) {
			senderTid.ioResult =  `Function '${project}-${codeName}' does not exist in $code wiki.`;
			msg.resultTiddlers.push(senderTid);
			return msg;
		}
		filter = `[prefix[${project}-${codeName}]]`;
		action = `Delete function '${project}-${codeName}'.`;
	}

	var tidDeleted = [];
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		$cw.wiki.deleteTiddler(title);
		tidDeleted.push(`  ${title}`);
	})

	senderTid.ioResult = `${action}\nTiddlers deleted from $code wiki: ` +
		`${tidDeleted.join('\n\n')}`;
	msg.resultTiddlers.push(senderTid);
	return msg;
}

topics.projectDelete = projectDelete;
