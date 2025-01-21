// Client acknowledges connect sequence is complete
$tpi.fn.io.ackConnect = function (socket, wiki, urlInfo) {
	var linkPort = get$proxy('GettingStarted').port;
	var wikiLink = `${urlInfo.protocol}//${urlInfo.hostname}:${linkPort}/${wiki}`;
	get$proxy(wiki).link = wikiLink;
	
	var wikiRequires = JSON.parse(get$tw('codebase').wiki.getTiddlersAsJson('[[$:/plugins/poc2go/pocket-io]] [[Copy Tiddlers]]'));
	// codebase already has required tiddlers
	wikiRequires = wiki === 'codebase' ? [] : wikiRequires;
	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wiki,
		list: $rw.utils.stringifyList(get$wikiNames),
		link: wikiLink
	});
	$sockets[sid(socket)] = { socket, wiki };
	socket.emit('ackConnect', wikiRequires);
	tog(`Client wiki '${wiki}' ${sid(socket)} connected`);
}
