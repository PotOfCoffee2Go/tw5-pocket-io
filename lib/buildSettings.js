// Build settings
const fs = require('node:fs');
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

function createWikiSettings(opts) {
	var webserverParams = opts.parameters.default;
	webserverParams = opts.credentials ?
		webserverParams.concat(opts.credentials.authorization) :
		webserverParams;
	return {
		name: opts.name,
		folder: `${opts.wikisDir}/${opts.name}`,
		excludeLinks: false,
		webserver:  {
			host: opts.webserver.host,
			port: opts.webserverPort,
			filesDir: `${opts.wikisDir}/${opts.name}/files`,
			parameters: webserverParams,
			credentials: opts.credentials
		},
		proxy: {
			domain: opts.proxy.domain,
			host: opts.proxy.host,
			port: opts.proxyPort,
			link: `http://${opts.proxy.domain}:${opts.proxyPort}`,
			targetUrl: `http://${opts.webserver.host}:${opts.webserverPort}`
		},
		$tw: null
	}
}

exports.buildSettings = function buildSettings(config) {
	const { wikisDir, defaultWiki, hideCodebase, webserver, proxy, parameters } = config;
	config.proxy.domain = config.domain;
	const { verifyCodebase, copyClientTiddlers } = require('./verifyCodebase');
	const credentials = require('./credentials')(config);

	var webserverPort = webserver.basePort;
	var proxyPort = proxy.basePort;

	verifyCodebase();

	var dirNames = fs.readdirSync(wikisDir, {withFileTypes: true})
			.filter(item => item.isDirectory())
			.map(item => item.name)

	// Insure default wiki exists and is first port
	if (dirNames.indexOf(defaultWiki) > -1) {
		dirNames.splice(dirNames.indexOf(defaultWiki), 1);
		dirNames.unshift(defaultWiki);
	} else {
		throw new Error(`Missing default wiki '${wikisDir}/${defaultWiki}' - see './config.js'`);
	}

	copyClientTiddlers(wikisDir, dirNames);

	const serverSettings = [];
	dirNames.forEach(name => {
		if (fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`)) {
			serverSettings.push(createWikiSettings({
				name, wikisDir, parameters,
				webserver, proxy,
				webserverPort, proxyPort,
				credentials: credentials[name],
			}));
			webserverPort++;
			proxyPort++;
		}
	});

	// Add codebase wiki
	serverSettings.push(createWikiSettings({
		name:'codebase', wikisDir:'./network', parameters,
		webserver, proxy, webserverPort, proxyPort,
		credentials: credentials['codebase']
	}));
	webserverPort++;
	proxyPort++;

	// Optionally force codebase only accessable from localhost browsers
	//  and for the most part excluded from lists of pocket-io wikis
	if (hideCodebase) {
		serverSettings.forEach((settings, idx) => {
			if (settings.name === 'codebase') {
				serverSettings[idx].webserver.host = '127.0.0.1';
				serverSettings[idx].proxy.domain = 'localhost';
				serverSettings[idx].proxy.host = '127.0.0.1';
				serverSettings[idx].proxy.link = `http://localhost:${settings.proxy.port}`;
				serverSettings[idx].excludeLinks = true;
			}
		})
	}

	return serverSettings;
}
