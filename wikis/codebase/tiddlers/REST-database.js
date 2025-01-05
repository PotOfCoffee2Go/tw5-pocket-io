// Get database tiddlers by filter
//   ex: '/tiddlers/[tag[project]]'

// Route for data server
//   ex: '/tiddlers/[tag[about]]'
get$router('database').get('/tiddlers/:filter', (req, res) => {
	const $tw = get$tw('database');
	var { filter } = req.params;
	var tiddlers = JSON.parse($tw.wiki.getTiddlersAsJson(filter));
	res.set('content-type', 'application/json');
	res.send(JSON.stringify(tiddlers, null, 4)); // insures formatted
});
