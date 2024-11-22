function badMsg(socket, msg, errText) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = errText;

	log(hue(errText,9));
	rt.displayPrompt();

	senderTid.ioResult = formatIoResult(errText);
	msg.resultTiddlers = [senderTid];
	return msg;
}

$topics.badMsg = badMsg;