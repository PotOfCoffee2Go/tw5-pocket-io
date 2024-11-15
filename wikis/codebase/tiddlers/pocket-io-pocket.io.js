var $sockets = {};
var topics = {};

io.on('connection', (socket) => {
	// Client acknowledges connect sequence is complete
	socket.on('ackConnect', () => {
		$sockets[sid(socket)] = socket;
		// getData(socket, '[tag[onStartup]]', true); // to story
		log(hue(`Client wiki ${sid(socket)} connected`, 44));
		rt.displayPrompt();
	})
	// Message from client
	socket.on('msg', msgStr => {
		var msg = $tw.utils.parseJSONSafe(msgStr,{ resultTiddlers: [] });
		if (!msg.req) {
			return topics.badMsg(socket, msg, 'Malformed message');
		}
		if (!(msg.req.topic && !!topics[msg.req.topic])) {
			return topics.badMsg(socket, msg, 'Invalid topic: ${msg.req.topic}');
		}
		socket.emit('msg',JSON.stringify(topics[msg.req.topic](socket, msg)));
	})
	// Remove from connected sockets
	socket.on('disconnect', () => {
		delete $sockets[socket.id];
		log(hue(`Client wiki ${sid(socket)} disconnected`, 128));
		rt.displayPrompt();
	});
});
