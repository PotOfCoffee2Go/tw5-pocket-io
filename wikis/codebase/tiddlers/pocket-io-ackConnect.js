// Client acknowledges connect sequence is complete
$tpi.fn.io.ackConnect = function ackConnect(socket, wiki) {
	$sockets[sid(socket)] = { socket, wiki };
	socket.emit('ackConnect','ackConnect'); // ack the ack
	hog(`Client wiki ${wiki} ${sid(socket)} connected`, 44);
	$rt.displayPrompt();
}
