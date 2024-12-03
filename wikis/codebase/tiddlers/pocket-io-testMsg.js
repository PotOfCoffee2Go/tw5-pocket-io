$tpi.topic.testMsg = function testMsg(socket, msg) {
	var senderTid = cpy(msg.senderTiddler);
	senderTid.ioResult = '';
	var tiddler = senderTid.title;

	senderTid.ioResult = $tpi.fn.formatIoResult(`Test message received from tiddler [[${tiddler}]]!`);
	msg.resultTiddlers.push(senderTid);
	return msg;
}
