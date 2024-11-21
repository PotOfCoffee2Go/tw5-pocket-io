function testMsg(socket, msg) {
 var senderTid = cpy(msg.senderTiddler);
 senderTid.ioResult = '';

 senderTid.ioResult = formatIoResult(`Test message received from tiddler [[${msg.req.sender}]]!`);
 msg.resultTiddlers.push(senderTid);
 return msg;
}

topics.testMsg = testMsg;
