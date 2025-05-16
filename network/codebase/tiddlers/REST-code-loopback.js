// Return the text entered in the request
// ex: '/wikiname/loopback/some text'
$wikiNames.forEach(name => {
	get$router(name).get(`/${name}/loopback/:text`, (req, res) => {
		var { text } = req.params;
		res.set('content-type', 'text/plain');
		res.send(`You said: ${text}`);
	});
})
