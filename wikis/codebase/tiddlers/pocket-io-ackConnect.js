// Client acknowledges connect sequence is complete
$tpi.fn.io.ackConnect = function ackConnect(socket) {
	$sockets[sid(socket)] = socket;
	socket.emit('ackConnect','ackConnect'); // ack the ack
	hog(`Client wiki ${sid(socket)} connected`, 44);
	$rt.displayPrompt();
}
