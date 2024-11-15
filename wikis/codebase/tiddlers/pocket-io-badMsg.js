function badMsg(socket, msg, errText) {
	log(hue(errText),9);
	return msg;
}

topics.badMsg = badMsg;
