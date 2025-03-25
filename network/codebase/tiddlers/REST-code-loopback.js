// Return the text entered in the request
// ex: '/loopback/some text'
$wikiNames.forEach(name => {
	get$router(name).get('/loopback/:text', (req, res) => {
		var { text } = req.params;
		res.set('content-type', 'text/plain');
		res.send(`You said: ${text}`);
	});
})
