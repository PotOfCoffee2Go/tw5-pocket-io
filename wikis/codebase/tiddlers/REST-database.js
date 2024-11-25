// Get database tiddlers by filter
//   ex: '/database/tiddlers/[tag[about]]'
router.get('/database/tiddlers/:filter', (req, res) => {
	var { filter } = req.params;
	var tiddlers = JSON.parse($dw.wiki.getTiddlersAsJson(filter));
	res.set('content-type', 'application/json');
	res.send(JSON.stringify(tiddlers, null, 4)); // insures formatted
});
