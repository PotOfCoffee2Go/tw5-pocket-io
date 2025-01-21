// Note: $tpi.fn.io.[ackConnect, msg, disconnect] must be defined
//  before this is run
get$wikiNames.forEach(name => {
	get$pocketio(name).on('connection', (socket) => {
		socket.on('ackConnect', (urlInfo) => $tpi.fn.io.ackConnect(socket, name, urlInfo));
		socket.on('msg', (msg) => $tpi.fn.io.msg(socket, msg));
		socket.on('disconnect', () => $tpi.fn.io.disconnect(socket, name));
	});
})
