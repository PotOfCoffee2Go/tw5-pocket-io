$tpi.fn.io.disconnect = function disconnect(socket, wiki) {
	delete $sockets[sid(socket)];
	tog(`Client wiki ${wiki} ${sid(socket)} disconnected`, 128);
}
