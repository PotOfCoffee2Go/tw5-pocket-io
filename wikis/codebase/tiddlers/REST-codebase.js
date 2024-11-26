// Get codebase tiddlers by filter
//   ex: '/tiddlers/[tag[project]]'

// Route for $code server
$code.router.get('/tiddlers/:filter', (req, res) => {
	var { filter } = req.params;
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	res.set('content-type', 'application/json');
	res.send(JSON.stringify(tiddlers, null, 4)); // insures formatted
});
