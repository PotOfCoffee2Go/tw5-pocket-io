// Upload code to server
$tpi.topic.projectUpload = function projectUpload(socket, msg) {
	var $cw = get$tw(msg.req.wikiName);
	var sender = cpy(msg.senderTiddler);
	sender.ioResult = '';

	var project = sender.title;
	var tabName = sender.ioPrjTabSelected;

	if (tabName === 'AALLLL') {
		tabName = `[tag[$:/pocket-io/${project}/code]]`;
	}
	if (!/^\[/.test(tabName)) {
		tabName = `[[${tabName}]]`;
	}
	var minify = true;
	if (sender.ioPrjMinify && sender.ioPrjMinify !== 'yes') {
		minify = false;
	}
	sender.ioResultUpload = $tpi.getCode(msg.req.wikiName,$cw, tabName, minify);
	msg.resultTiddlers.push(sender);
	return msg;
}
