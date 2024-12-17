// Server side $code proxy socket message handlers:
//  Client acknowledges connect sequence is complete
//  Message from client
//  Disconnect removes socket from connected sockets
$code.pocketio.on('connection', (socket) => {
	socket.on('ackConnect', () => $tpi.fn.io.ackConnect(socket));
	socket.on('msg', (msgStr) => $tpi.fn.io.msg(socket, msgStr));
	socket.on('disconnect', () => $tpi.fn.io.disconnect(socket));
});
