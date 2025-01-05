// Server side $dash proxy socket message handlers:
//  Client acknowledges connect sequence is complete
//  Message from client
//  Disconnect removes socket from connected sockets
get$pocketio('dashbase').on('connection', (socket) => {
	socket.on('ackConnect', () => $tpi.fn.io.ackConnect(socket, '$dash'));
	socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
	socket.on('disconnect', () => $tpi.fn.io.disconnect(socket, '$dash'));
});
