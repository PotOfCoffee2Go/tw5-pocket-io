// Client acknowledges connect sequence is complete and ready
//  for startup tiddlers from server
$tpi.fn.io.ackConnect = function (socket, wikiName) {
	var wikiLinks = [];
	$wikiNames.forEach(name => {	wikiLinks.push(`[[${name}|${get$proxy(name).link}]]`); })

	const sendOnConnect = [
		'[tag[$:/tags/pocket-io/broadcast]]',
		'[[$:/themes/tiddlywiki/vanilla/options/sidebarlayout]]'
	].join(' ');

	var wikiRequires = JSON.parse($twCodebase.wiki.getTiddlersAsJson(sendOnConnect));
	// codebase already has required tiddlers
	wikiRequires = wikiName === 'codebase' ? [] : wikiRequires;
	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wikiName,
		list: $rw.utils.stringifyList($wikiNames),
		link: get$proxy(wikiName).link,
		wikiLinks: $rw.utils.stringifyList(wikiLinks)
	});
	var fakeMsg = { senderTiddler: {}, resultTiddlers: [] };
	var wikiDisplay = $tpi.topic.projectNetworkTable(socket, fakeMsg);
	if (fakeMsg.resultTiddlers.length) {
		wikiRequires.push(fakeMsg.resultTiddlers[0]);
	}

	// Add this client's socket to list of connected clients
	$sockets[sid(socket)] = { socket, wikiName };
	
	socket.emit('ackConnect', wikiRequires);
	tog(`Client wiki '${wikiName}' ${sid(socket)} connected`);
}
