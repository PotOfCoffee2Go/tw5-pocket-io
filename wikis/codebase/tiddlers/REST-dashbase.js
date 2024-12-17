// Get dashbase tiddlers by filter
//   ex: '/tiddlers/[[dashboard]]'

// Route for $dash server
$dash.router.get('/tiddlers/:filter', (req, res) => {
	var { filter } = req.params;
	var tiddlers = JSON.parse($ds.wiki.getTiddlersAsJson(filter));
	res.set('content-type', 'application/json');
	res.send(JSON.stringify(tiddlers, null, 4)); // insures formatted
});
