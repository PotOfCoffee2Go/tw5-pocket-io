// Delete a project's code or a project completely
$tpi.topic.projectDelete = function projectDelete(socket, msg) {
	var $cw = get$tw(msg.req.wikiName);
	var sender = cpy(msg.senderTiddler);
	sender.ioResult = '';

	var project = sender.title;
	var tabName = sender.ioPrjTabToDelete;
	var confirm = sender.ioConfirmDelete;

	if (confirm !== 'yes') {
		sender.ioResult = `Must check the confirm checkbox to delete code tiddlers`;
		sender.ioConfirmDelete = 'no';
		msg.resultTiddlers.push(sender);
		return msg;
	}
	sender.ioConfirmDelete = 'no';

	if (!(project && tabName)) {
		sender.ioResult = 'A project and Tab name are required!';
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var filter, action;
	if (tabName === 'AALLLL') {
		filter = `[tag[${project}]]`;
		action = `Delete project '${project}'.`;
	} else {
		if (!$cw.wiki.tiddlerExists(`${tabName}`)) {
			sender.ioResult = `Tab '${tabName}' does not exist.`;
			msg.resultTiddlers.push(sender);
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

	sender.ioResult = `${action}\n\nTiddlers deleted:\n\n${tidDeleted.join(', ')}`;
	msg.resultTiddlers.push(sender);
	return msg;
}
