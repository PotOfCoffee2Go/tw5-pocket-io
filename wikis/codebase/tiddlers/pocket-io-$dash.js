// Server side $dash proxy socket message handlers:
//  Client acknowledges connect sequence is complete
//  Message from client
//  Disconnect removes socket from connected sockets
if ($dash.pocketio) {
	$dash.pocketio.on('connection', (socket) => {
		socket.on('ackConnect', () => $tpi.fn.io.ackConnect(socket, '$dash'));
		socket.on('msg', (msgStr) => $tpi.fn.io.msg(socket, msgStr));
		socket.on('disconnect', () => $tpi.fn.io.disconnect(socket, '$dash'));
	});
}
