// Message from client
$tpi.fn.io.msg = function msg(socket, msg) {
	// Malformed message
	if (!(msg.req && msg.req.topic)) {
		hog('Malformed message - no msg.req.topic field',9);
		dir(msg);
		$rt.displayPrompt();
		return;
	}
	// Message is for Node-Red runtime
	// '$nrMsgNodes' is array of all 'TW client in' nodes in
	//  the Node-Red workspace
	if (msg.req.command === 'nodered') {
		// add client socket Id to message so Node-Red can respond
		msg.req.socketId = sid(socket);
		// 'node' is the Node-Red node
		// Copy the message so each 'TW client in' node has unique msg
		// and send down the output wire
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

	// Is a message for pocket-io topic
	if (!(msg.req.topic && !!$tpi.topic[msg.req.topic])) {
		socket.emit('msg',$tpi.topic['badMsg'](socket, msg, `Error: Invalid topic: ${msg.req.topic}`));
		return;
	}

	// Send the message to the code for the topic and get result
	//  Result back to client
	var resultMsg = $tpi.topic[msg.req.topic](socket, msg);
	socket.emit('msg', resultMsg);

	// Have all clients for this wiki do a refresh from server
	$refreshClients(msg.req.wikiName);
}
