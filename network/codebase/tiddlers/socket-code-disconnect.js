// Remove socket from list of connected sockets when client disconnects
$tpi.fn.io.disconnect = function disconnect(socket, wiki) {
	const wikiName = $sockets[sid(socket)].wikiName;
	delete $sockets[sid(socket)];
	tog(`Client wiki '${wikiName}' ${sid(socket)} disconnected`, 128);
}
