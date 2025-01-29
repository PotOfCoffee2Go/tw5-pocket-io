// Get tiddlers based on TiddlyWiki filter
// ex: '/tiddlers/[tag[About]]
get$wikiNames.forEach(name => {
	get$router(name).get('/tiddlers/:filter', (req, res) => {
		const $tw = get$tw(name);
		var { filter } = req.params;
		var tiddlers = JSON.parse($tw.wiki.getTiddlersAsJson(filter));
		res.set('content-type', 'application/json');
		res.send(JSON.stringify(tiddlers, null, 4)); // insures formatted
	});
})
