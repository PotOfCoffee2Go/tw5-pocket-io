// Client acknowledges connect sequence is complete and ready
//  for startup tiddlers from server
$tpi.fn.io.ackConnect = function (socket, info) {
	const getInfo = (infoTitle) => info.tiddlers[infoTitle].text; 

	const sendOnConnect = [
		'[tag[$:/tags/pocket-io/broadcast]]',
		'[[$:/themes/tiddlywiki/vanilla/options/sidebarlayout]]'
	].join(' ');

	var wikiName = getInfo('$:/info/url/pathname').replace('/','');
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

	// only show allowed wikis
	var nameList = [];
	var sameProxy = get$server(wikiName).isPublic;
	$wikiNames.forEach(wName => {
		if (get$server(wName).isPublic !== sameProxy) {
				return;
		}
		nameList.push(wName);
	})


	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wikiName,
		list: $rw.utils.stringifyList(nameList),
		link: getInfo('$:/info/url/full'),
	});
	
	// projectNetworkTable second parameter is a Message
	// so create a fake one
/*
	var fakeMsg = { senderTiddler: {}, resultTiddlers: [] };
	var wikiDisplay = $tpi.topic.projectNetworkTable(socket, fakeMsg);
	if (fakeMsg.resultTiddlers.length) {
		wikiRequires.push(fakeMsg.resultTiddlers[0]);
	}
*/
	// Add this client's socket to list of connected clients
	$sockets[sid(socket)] = { socket, wikiName };

	socket.emit('ackConnect', wikiRequires);
	tog(`Client wiki '${wikiName}' ${sid(socket)} connected`);
}
