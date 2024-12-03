// Server side Socket message handler
$code.io.on('connection', (socket) => {
	// Client acknowledges connect sequence is complete
	socket.on('ackConnect', () => {
		$sockets[sid(socket)] = socket;
		// getData(socket, '[tag[onStartup]]', true); // to story
		socket.emit('ackConnect','ackConnect'); // ack the ack
 		log(hue(`Client wiki ${sid(socket)} connected`, 44));
		$rt.displayPrompt();
	})
	// Message from client
	socket.on('msg', msgStr => {
		var msg = $tw.utils.parseJSONSafe(msgStr,{ resultTiddlers: [] });
		if (!(msg.req && msg.req.topic)) {
			log(hue('Malformed message - no msg.req.topic field',9));
			dir(msg);
			return;
		}
		if (!(msg.req.topic && !!$tpi.topic[msg.req.topic])) {
			socket.emit('msg',JSON.stringify($tpi.topic['badMsg'](socket, msg, `Invalid topic: ${msg.req.topic}`)));
			return;
		}
		socket.emit('msg',JSON.stringify($tpi.topic[msg.req.topic](socket, msg)));
	})
	// Remove from connected sockets
	socket.on('disconnect', () => {
		delete $sockets[socket.id];
		log(hue(`Client wiki ${sid(socket)} disconnected`, 128));
		$rt.displayPrompt();
	});
});
