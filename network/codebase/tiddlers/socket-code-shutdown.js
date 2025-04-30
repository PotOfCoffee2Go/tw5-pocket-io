// Broadcast a shutdown to all clients
function $shutdown() {
	for (let client in $sockets) {
			$sockets[client].socket.emit('shutdown');
	}
	$sockets = {};
	$rt.displayPrompt();
	hog('All clients disconnected - system shutdown', 163); 
	process.exit(9);
}