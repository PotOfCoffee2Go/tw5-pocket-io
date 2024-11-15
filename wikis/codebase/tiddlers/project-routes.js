// Get codebase tiddlers by filter
//   ex: '/codebase/tiddlers/[tag[project]]'
router.get('/codebase/tiddlers/:filter', (req, res) => {
  var { filter } = req.params;
  var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
  res.set('content-type', 'text/plain');
  res.send(JSON.stringify(tiddlers, null, 4)); // insures formatted
});

// '/loopback/:command/:project/:fnName?'
router.get('/loopback/:command', (req, res) => {
  var { command } = req.params;
  res.set('content-type', 'text/plain');
  res.send(`You said: ${command}\n`);
});
