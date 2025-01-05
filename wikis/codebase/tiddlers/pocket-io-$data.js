// Server side $data proxy socket message handlers:
//  Client acknowledges connect sequence is complete
//  Message from client
//  Disconnect removes socket from connected sockets
get$pocketio('database').on('connection', (socket) => {
	socket.on('ackConnect', () => $tpi.fn.io.ackConnect(socket, '$data'));
	socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
	socket.on('disconnect', () => $tpi.fn.io.disconnect(socket, '$data'));
});
