function testMsg(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';
	var tiddler = senderTid.title;

	senderTid.ioResult = formatIoResult(`Test message received from tiddler [[${tiddler}]]!`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}

$topics.testMsg = testMsg; // is a topic
