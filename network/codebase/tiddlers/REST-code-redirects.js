// All proxy servers can Redirect to another wiki's proxy server
// ex: 'http://{host}/dashboard' links to dashboard wiki
/*
$wikiNames.forEach(wikiName => {
	hog(`{$wikiName} setup`);
	var wikiPort = get$settings(wikiName).proxy.port;
	get$router(wikiName).get(`/${wikiName}`, (req, res) => {
		var arrHost = req.get('host').split(':');
		arrHost.pop();
		arrHost.push(wikiPort);
		var newHost = arrHost.join(':');
		var fullUrl = req.protocol + '://' + newHost + '/';
		res.redirect(301, fullUrl);
	})
})
*/
