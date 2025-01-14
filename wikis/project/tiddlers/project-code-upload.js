// Upload code to server
$tpi.topic.projectUpload = function projectUpload(socket, msg) {
	var $cw = get$tw(msg.req.wikiName);
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var project = senderTid.title;
	var tabName = senderTid.ioPrjTabSelected;

	if (tabName === 'AALLLL') {
		tabName = `[tag[$:/pocket-io/code/${project}]]`;
	}
	if (!/^\[/.test(tabName)) {
		tabName = `[[${tabName}]]`;
	}
	var minify = true;
	if (senderTid.ioPrjMinify && senderTid.ioPrjMinify !== 'yes') {
		minify = false;
	}
	senderTid.ioResult = $tpi.fn.formatIoResult($tpi.getCode(msg.req.wikiName,$cw, tabName, minify));
	msg.resultTiddlers.push(senderTid);
	return msg;
}