// Pocket.io implementation
var $sockets = {};
io.on('connection', (socket) => {
	// Reply to a client
	socket.reply = (str) => {
		socket.emit('eval',stringifyTiddler(str));
	}
    // Client acknowledges connect sequence is complete 
	socket.on('ackConnect', () => {
		$sockets[sid(socket)] = socket;
		getData(socket, '[tag[onStartup]]');
		log(hue(`Client wiki ${sid(socket)} connected`,44));
		rt.displayPrompt();
	})
    // Client requests command to be evaluated
	socket.on('eval', (jsonTiddlers) => {
		var tiddlers = parseTiddlers(jsonTiddlers);
		if (/^getData\(/.test(tiddlers[0].text)) {
			tiddlers[0].text = tiddlers[0].text.replace('getData(',`getData($sockets['${sid(socket)}'],`);
		}
        rt.write(`$sockets['${sid(socket)}'].reply(${tiddlers[0].text})\n`);
	});
    // Remove from connected sockets
	socket.on('disconnect', () => {
		delete $sockets[socket.id];
		log(hue(`Client wiki ${sid(socket)} disconnected`,128));
		rt.displayPrompt();
	});
});
