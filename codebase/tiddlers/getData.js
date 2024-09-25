// Copy tiddlers from database wiki to client single file wiki
function getData(socket, filter, tostory = false) {
	let tiddlers = $dw.wiki.getTiddlersAsJson(filter);
	if (tostory) {
		socket.emit('tostory',tiddlers);
	}
	else {
		socket.emit('tiddlers',tiddlers);
	}
	return `${JSON.parse(tiddlers).length} tiddlers updated`;
}
