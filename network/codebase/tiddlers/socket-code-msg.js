// Message from client
$tpi.fn.io.msg = function msg(socket, msg) {
	if (!(msg.req && msg.req.topic)) {
		hog('Malformed message - no msg.req.topic field',9);
		dir(msg);
		$rt.displayPrompt();
		return;
	}
	if (msg.req.command === 'nodered') {
		$nrInMsg.enQueue(msg);
		return;
	}

	if (!(msg.req.topic && !!$tpi.topic[msg.req.topic])) {
		socket.emit('msg',$tpi.topic['badMsg'](socket, msg, `Error: Invalid topic: ${msg.req.topic}`));
		return;
	}

	var resultMsg = $tpi.topic[msg.req.topic](socket, msg);
	socket.emit('msg', resultMsg);
	$tpi.fn.io.refreshClients(msg.req.wikiName);
}
