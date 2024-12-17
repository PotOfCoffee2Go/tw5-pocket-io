$tpi.fn.io.disconnect = function disconnect(socket) {
	delete $sockets[sid(socket)];
	hog(`Client wiki ${sid(socket)} disconnected`, 128);
	$rt.displayPrompt();
}
