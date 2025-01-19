// Have client wikis refresh GUI on updates
$tpi.fn.io.refreshClients = function (wikiName = '') {
	for (client in $sockets) {
		if (wikiName === '' || $sockets[client].wiki === wikiName) {
			$sockets[client].socket.emit('refresh');
		}
	}
}
