// Server side $code proxy socket message handlers:
//  Client acknowledges connect sequence is complete
//  Message from client
//  Disconnect removes socket from connected sockets
get$pocketio('codebase').on('connection', (socket) => {
	socket.on('ackConnect', () => $tpi.fn.io.ackConnect(socket, '$code'));
	socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
	socket.on('disconnect', () => $tpi.fn.io.disconnect(socket, '$code'));
});
