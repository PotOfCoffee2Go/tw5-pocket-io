// Return the text entered in the request
// ex: '/loopback/some text'
router.get('/loopback/:text', (req, res) => {
	var { text } = req.params;
	res.set('content-type', 'text/plain');
	res.send(`You said: ${text}`);
});
