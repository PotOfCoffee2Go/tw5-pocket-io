$tpi.topic.testMsg = function testMsg(socket, msg) {
	dir(msg,1);
	$rt.displayPrompt();
	
	var sender = cpy(msg.senderTiddler);
	sender.ioResult = '';

	var title = sender.title;
	sender.ioResult = `Test message received from tiddler [[${title}]]!`;

	msg.resultTiddlers.push(sender);
	return msg;
}
