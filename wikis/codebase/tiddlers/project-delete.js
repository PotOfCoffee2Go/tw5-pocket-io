// Delete a project's code or a project completely
$tpi.topic.projectDelete = function projectDelete(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var project = senderTid.title;
	var tabName = senderTid.ioPrjTabToDelete;
	var confirm = senderTid.ioConfirmDelete;

	if (confirm !== 'yes') {
		senderTid.ioResult = $tpi.fn.formatIoResult(`Must check the confirm checkbox to delete code tiddlers`);
		senderTid.ioConfirmDelete = 'no';
		msg.resultTiddlers.push(senderTid);
		return msg;
	}
	senderTid.ioConfirmDelete = 'no';

	if (!(project && tabName)) {
		senderTid.ioResult = $tpi.fn.formatIoResult('A project and Tab name are required!');
		msg.resultTiddlers.push(senderTid);
		return msg;
	}

	var filter, action;
	if (tabName === 'AALLLL') {
		filter = `[tag[${project}]]`;
		action = `Delete project '${project}'.`;
	} else {
		if (!$cw.wiki.tiddlerExists(`${tabName}`)) {
			senderTid.ioResult =  formatIoResult(`Tab '${tabName}' does not exist.`);
			msg.resultTiddlers.push(senderTid);
			return msg;
		}
		filter = `[prefix[${tabName}]]`;
		action = `Delete Tab '${tabName}'.`;
	}

	var tidDeleted = [];
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		$cw.wiki.deleteTiddler(title);
		tidDeleted.push(`${title}`);
	})

	senderTid.ioResult = $tpi.fn.formatIoResult(`${action}\n\nTiddlers deleted:\n\n${tidDeleted.join(', ')}`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}
