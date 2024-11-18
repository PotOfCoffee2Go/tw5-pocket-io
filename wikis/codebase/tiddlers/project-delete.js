// Delete a project's code or a project completely
function projectDelete(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var project = senderTid.ioPrjProject;
	var tabName = senderTid.ioPrjTabName;

	if (!(project && tabName)) {
		senderTid.ioResult = 'A @@project and Tab name@@ are required!\n\n ' +
			`Use ioPrjTabName '!!!delete all!!!' to remove a project.`;
		msg.resultTiddlers.push(senderTid);
		return msg;
	}
	var filter, action;
	if (tabName === '!!!delete all!!!') {
		filter = `[tag[${project}]]`;
		action = `Delete project '${project}'.`;
	} else {
		if (!$cw.wiki.tiddlerExists(`${project}-${tabName}`)) {
			senderTid.ioResult =  `Tab '${project}-${tabName}' does not exist.`;
			msg.resultTiddlers.push(senderTid);
			return msg;
		}
		filter = `[prefix[${project}-${tabName}]]`;
		action = `Delete Tab '${project}-${tabName}'.`;
	}

	var tidDeleted = [];
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		$cw.wiki.deleteTiddler(title);
		tidDeleted.push(`${title}`);
	})

	senderTid.ioResult = `${action}\n\nTiddlers deleted: ${tidDeleted.join(', ')}`;
	msg.resultTiddlers.push(senderTid);
	return msg;
}

topics.projectDelete = projectDelete;
