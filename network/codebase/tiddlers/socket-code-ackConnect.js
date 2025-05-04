// Client acknowledges connect sequence is complete and ready
//  for startup tiddlers from server
$tpi.fn.io.ackConnect = function (socket, wikiName) {
	var wikiLinks = [];
	$wikiNames.forEach(name => { wikiLinks.push(`[[${name}|${get$proxy(name).link}]]`); })
	var nodeRedAdminLink = `[[Node-Red Editor|${get$server(wikiName).nodeRedLink}]]`;

	const sendOnConnect = [
		'[tag[$:/tags/pocket-io/broadcast]]',
		'[[$:/themes/tiddlywiki/vanilla/options/sidebarlayout]]'
	].join(' ');

	var wikiRequires = JSON.parse($twCodebase.wiki.getTiddlersAsJson(sendOnConnect));
	// codebase already has required tiddlers
	wikiRequires = wikiName === 'codebase' ? [] : wikiRequires;

	// Set modification date/time of 'Pocket-io System' tiddler
	//  to when the client connected
	for (let i = 0; i < wikiRequires.length; i++) {
		if (wikiRequires[i].title === 'Pocket-io System') {
			wikiRequires[i].modified = $rw.utils.stringifyDate(new Date());;
			break;
		}
	}

	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wikiName,
		list: $rw.utils.stringifyList($wikiNames),
		link: get$proxy(wikiName).link,
		wikiLinks: $rw.utils.stringifyList(wikiLinks),
		nodeRedAdminLink: nodeRedAdminLink
	});
	
	// projectNetworkTable second parameter is a Message
	// so create a fake one
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
