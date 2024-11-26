// Return the text entered in the request
// ex: '/loopback/some text'

// Route for the $data server
$data.router.get('/loopback/:text', (req, res) => {
	var { text } = req.params;
	res.set('content-type', 'text/plain');
	res.send(`You said: ${text}`);
});

// and $code server
$code.router.get('/loopback/:text', (req, res) => {
	var { text } = req.params;
	res.set('content-type', 'text/plain');
	res.send(`You said: ${text}`);
});
