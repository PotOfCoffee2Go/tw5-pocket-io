function badMsg(socket, msg, errText) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = errText;

	hog(errText,9);
	$rt.displayPrompt();

	senderTid.ioResult = $tpi.fn.formatIoResult(errText);
	msg.resultTiddlers = [senderTid];
	return msg;
}

$topics.badMsg = badMsg;
