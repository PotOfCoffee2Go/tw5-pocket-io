// Message from client
$tpi.fn.io.msg = function msg(socket, msg) {
	if (!(msg.req && msg.req.topic)) {
		hog('Malformed message - no msg.req.topic field',9);
		dir(msg);
		$rt.displayPrompt();
		return;
	}
	if (msg.req.command === 'nodered') {
		msg.req.socketId = sid(socket);
		$nrMsgNodes.forEach(node => {
			node.send(Object.assign({},{
				topic: msg.req.topic,
				wikiname: msg.req.wikiName,
				payload: [],
				wiki: msg}));
			node.status({fill: 'green', shape: 'dot',
				text: `Wiki:  ${msg.req.wikiName} Topic: ${msg.req.topic}`});
		})
		return;
	}

	if (!(msg.req.topic && !!$tpi.topic[msg.req.topic])) {
		socket.emit('msg',$tpi.topic['badMsg'](socket, msg, `Error: Invalid topic: ${msg.req.topic}`));
		return;
	}

	var resultMsg = $tpi.topic[msg.req.topic](socket, msg);
	socket.emit('msg', resultMsg);
	$refreshClients(msg.req.wikiName);
}
