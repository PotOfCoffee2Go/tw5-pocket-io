// Build settings
const fs = require('node:fs');

exports.buildSettings = function buildSettings(config) {
	const { wikisDir, webserver, proxy } = config;
	var webserverPort = webserver.basePort;
	var proxyPort = proxy.basePort;

	const dirNames = fs.readdirSync(wikisDir, {withFileTypes: true})
			.filter(item => item.isDirectory())
			.map(item => item.name)

	const serverSettings = [];
	dirNames.forEach(name => {
		if (fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`)) {
			serverSettings.push({
				name: name,
				folder: `${wikisDir}/${name}`,
				$tw: null,
				webserver:  {
					host: webserver.host,
					port: webserverPort,
					filesDir: `${wikisDir}/${name}/files`,
					parameters: []
				},
				proxy: {
					host: proxy.host,
					port: proxyPort,
					targetUrl: `http://${webserver.host}:${webserverPort}`
				}
			});
			webserverPort++;
			proxyPort++;
		}
	});

	return serverSettings;
}
