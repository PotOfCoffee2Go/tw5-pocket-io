// Broadcast message to clients connected to a wikiName
// If not given a wikiName - broadcasts to all connected wikis
function $broadcastClients(wikiname, msg) {
	wikiname = wikiname ?? '';
	for (let client in $sockets) {
		if (wikiname === '' || $sockets[client].wikiName === wikiname) {
			$sockets[client].socket.emit('msg', msg);
		}
	}
}
