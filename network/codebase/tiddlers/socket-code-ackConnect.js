// Client acknowledges connect sequence is complete and ready
//  for startup tiddlers from server
$rw.utils.parseJSONSafe($rw.wiki.getTiddler('$:/temp/info-plugin').fields.text)
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

	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wikiName,
		list: $rw.utils.stringifyList($wikiNames),
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
