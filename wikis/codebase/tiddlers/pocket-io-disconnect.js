$tpi.fn.io.disconnect = function disconnect(socket, wiki) {
	delete $sockets[sid(socket)];
	hog(`Client wiki ${wiki} ${sid(socket)} disconnected`, 128);
	$rt.displayPrompt();
}
