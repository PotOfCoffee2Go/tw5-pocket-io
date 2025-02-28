// Client acknowledges connect sequence is complete
$tpi.fn.io.ackConnect = function (socket, wikiName) {
	var wikiLinks = [];
	get$wikiNames.forEach(name => {	wikiLinks.push(`[[${name}|${get$proxy(name).link}]]`); })

	const sendOnConnect = [
		'[tag[$:/tags/pocket-io/broadcast]]',
		'[[$:/themes/tiddlywiki/vanilla/options/sidebarlayout]]'
	].join(' ');

	var wikiRequires = JSON.parse(get$twCodebase.wiki.getTiddlersAsJson(sendOnConnect));
	// codebase already has required tiddlers
	wikiRequires = wikiName === 'codebase' ? [] : wikiRequires;
	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wikiName,
		list: $rw.utils.stringifyList(get$wikiNames),
		link: wikiName === 'codebase' ? '' : get$proxy(wikiName).link,
		wikiLinks: $rw.utils.stringifyList(wikiLinks)
	});
	var fakeMsg = { senderTiddler: {}, resultTiddlers: [] };
	var wikiDisplay = $tpi.topic.projectAllProjects(socket, fakeMsg);
	if (fakeMsg.resultTiddlers.length) {
		wikiRequires.push(fakeMsg.resultTiddlers[0]);
	}

	$sockets[sid(socket)] = { socket, wikiName };
	socket.emit('ackConnect', wikiRequires);
	tog(`Client wiki '${wikiName}' ${sid(socket)} connected`);
}
