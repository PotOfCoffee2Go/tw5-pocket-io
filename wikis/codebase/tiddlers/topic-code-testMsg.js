$tpi.topic.testMsg = function testMsg(socket, msg) {
	dir(msg,1);
	$rt.displayPrompt();
	
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';

	var title = senderTid.title;
	senderTid.ioResult = `Test message received from tiddler [[${title}]]!`;

	msg.resultTiddlers.push(senderTid);
	return msg;
}
