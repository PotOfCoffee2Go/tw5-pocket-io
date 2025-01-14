// Client acknowledges connect sequence is complete
$tpi.fn.io.ackConnect = function ackConnect(socket, wiki) {
	var wikiRequires = JSON.parse(get$tw('codebase').wiki.getTiddlersAsJson('[prefix[$:/poc2go/pocket-io/]] [[Copy Tiddlers]]'));
	// codebase already has required tiddlers
	wikiRequires = wiki === 'codebase' ? [] : wikiRequires;
	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wiki,
		list: $rw.utils.stringifyList(get$wikiNames)
	});
	$sockets[sid(socket)] = { socket, wiki };
	socket.emit('ackConnect', wikiRequires);
	tog(`Client wiki '${wiki}' ${sid(socket)} connected`, 44);
}
