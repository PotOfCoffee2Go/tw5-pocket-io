// Get codebase tiddlers by filter
//   ex: '/codebase/tiddlers/[tag[project]]'
router.get('/codebase/tiddlers/:filter', (req, res) => {
	var { filter } = req.params;
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	res.set('content-type', 'application/json');
	res.send(JSON.stringify(tiddlers, null, 4)); // insures formatted
});