// Client acknowledges connect sequence is complete
$tpi.fn.io.ackConnect = function (socket, wikiName, urlInfo) {
	var wikiRequires = JSON.parse(get$tw('codebase').wiki.getTiddlersAsJson('[[$:/plugins/poc2go/pocket-io]] [tag[$:/tags/pocket-io/broadcast]]'));
	// codebase already has required tiddlers
	wikiRequires = wikiName === 'codebase' ? [] : wikiRequires;
	var links = [];
	get$wikiNames.forEach(name => {
		links.push(`[[${name}|${get$proxy(name).link}]]`);
	})
	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wikiName,
		list: $rw.utils.stringifyList(get$wikiNames),
		link: get$proxy(wikiName).link,
		wikiLinks: $rw.utils.stringifyList(links)
	});
	$sockets[sid(socket)] = { socket, wikiName };
	socket.emit('ackConnect', wikiRequires);
	tog(`Client wiki '${wikiName}' ${sid(socket)} connected`);
}
