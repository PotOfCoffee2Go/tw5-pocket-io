// Return the text entered in the request
// ex: '/loopback/some text'

// Route for the $data server
get$router('database').get('/loopback/:text', (req, res) => {
	var { text } = req.params;
	res.set('content-type', 'text/plain');
	res.send(`You said: ${text}`);
});

// and $code server
get$router('codebase').get('/loopback/:text', (req, res) => {
	var { text } = req.params;
	res.set('content-type', 'text/plain');
	res.send(`You said: ${text}`);
});
