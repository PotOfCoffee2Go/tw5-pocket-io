// Note: $tpi.fn.io.[ackConnect, msg, disconnect] must be defined
//  before this is run (ie: are before this code in the 'Server Code' tabs)

// For each proxy server, add handlers for events from a client
$ss.forEach(settings => {
	get$pocketio(settings.name).on('connection', (socket) => {
		socket.on('ackConnect', () => $tpi.fn.io.ackConnect(socket, settings.name));
		socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
		socket.on('disconnect', () => $tpi.fn.io.disconnect(socket, settings.name));
	})
})
