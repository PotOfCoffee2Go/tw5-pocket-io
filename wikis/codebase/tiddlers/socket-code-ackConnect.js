// Client acknowledges connect sequence is complete
$tpi.fn.io.ackConnect = function (socket, wikiName, urlInfo) {
	var wikiLinks = [];
	get$wikiNames.forEach(name => {	wikiLinks.push(`[[${name}|${get$proxy(name).link}]]`); })

	const sendOnConnect = [
		'[[$:/plugins/poc2go/pocket-io]]',
		'[[$:/plugins/poc2go/pocket-io/project]]',
		'[tag[$:/tags/pocket-io/broadcast]]',
		'[[$:/themes/tiddlywiki/vanilla/options/sidebarlayout]]'
	].join(' ');
	
	var wikiRequires = JSON.parse(get$tw('codebase').wiki.getTiddlersAsJson(sendOnConnect));
	// codebase already has required tiddlers
	wikiRequires = wikiName === 'codebase' ? [] : wikiRequires;
	wikiRequires.push({
		title: '$:/temp/pocket-io/wikinames',
		text: wikiName,
		list: $rw.utils.stringifyList(get$wikiNames),
		link: get$proxy(wikiName).link,
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
