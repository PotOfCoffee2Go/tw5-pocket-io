// Have client wikis refresh from server
// If not given a wikiName - refreshes all connected wikis
const $refreshClients = function(wikiName = '') {
	for (let client in $sockets) {
		if (wikiName === '' || $sockets[client].wikiName === wikiName) {
			$sockets[client].socket.emit('refresh');
		}
	}
}
