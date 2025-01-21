// Redirect to a wiki's proxy server
// ex: '/dashboard'
get$wikiNames.forEach(wiki => {
	var wikiPort = get$settings(wiki).proxy.port;
	get$router('GettingStarted').get(`/${wiki}`, (req, res) => {
		var arrHost = req.get('host').split(':');
		arrHost.pop();
		arrHost.push(wikiPort);
		var newHost = arrHost.join(':');
		var fullUrl = req.protocol + '://' + newHost + '/';
		res.redirect(301, fullUrl);
	})
})
