// Have client wikis refresh from server
// If not given a wikiName - refreshes all connected wikis
function $broadcastClients(wikiname, msg) {
	wikiname = wikiname ?? '';
	for (let client in $sockets) {
		if (wikiname === '' || $sockets[client].wikiName === wikiname) {
			$sockets[client].socket.emit('msg', msg);
		}
	}
}
