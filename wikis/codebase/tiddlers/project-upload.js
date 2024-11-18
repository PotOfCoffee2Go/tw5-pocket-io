// Upload code to server
function projectUpload(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';
	if (!/^\[/.test(senderTid.ioPrjUpload)) {
		senderTid.ioPrjUpload = `[[${senderTid.ioPrjUpload}]]`;
	}

	var titles = [];
	$cw.wiki.filterTiddlers(senderTid.ioPrjUpload).forEach(title => {
		var codeTid = `[[${title}]]`;
		getCode(codeTid);
		titles.push(codeTid);
	})

	senderTid.ioResult = `Uploaded code tiddlers: ${titles.join(', ')}`;
	senderTid.ioPrjUpload = stripBrackets(senderTid.ioPrjUpload);
	msg.resultTiddlers.push(senderTid);
	return msg;
}

topics.projectUpload = projectUpload;
