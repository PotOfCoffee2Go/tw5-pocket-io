function badMsg(socket, msg, errText) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = errText;

	log(hue(errText,9));
	rt.displayPrompt();

	msg.resultTiddlers.push(senderTid);
	return msg;
}

topics.badMsg = badMsg;
