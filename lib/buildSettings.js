// Build settings
const fs = require('node:fs');
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

function verifyRequirements() {
	if (!fs.existsSync(`./network/codebase/tiddlywiki.info`)) {
		hog(`'server' edition wiki './network/codebase/tiddlywiki.info' is required!`, 9);
		process.exit(1);
	}
	if (!fs.existsSync(`./network/codebase/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js.meta`)) {
		hog(`'./network/codebase/tiddler$__poc2go_macro_tw5-pocket-io_network.js.meta' is required!`, 9);
		process.exit(2);
	}
	if (!fs.existsSync(`./network/codebase/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js`)) {
		hog(`'./network/codebase/tiddler$__poc2go_macro_tw5-pocket-io_network.js' is required!`, 9);
		process.exit(3);
	}
}

function verifyWikiName(wikisDir, name) {
	if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(name)) {
		hog(`'server' edition directory '${wikisDir}/${name}' name must be a valid JavaScript variable name`,9);
		process.exit(4);
	}
}

function copyClientTiddlers(wikisDir, dirNames) {
	dirNames.forEach(name => {
		if (name === 'codebase') { return; } // skip codebase
		verifyWikiName(wikisDir, name);
		if (fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`)) {
			fs.copyFileSync(`./network/codebase/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js.meta`,
				`${wikisDir}/${name}/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js.meta`);
			fs.copyFileSync(`./network/codebase/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js`,
				`${wikisDir}/${name}/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js`);
			if (!fs.existsSync(`${wikisDir}/${name}/tiddlers/$__SplashScreen.tid`)) {
				fs.copyFileSync(`./network/codebase/tiddlers/$__SplashScreen.tid`,
				`${wikisDir}/${name}/tiddlers/$__SplashScreen.tid`);
				fs.copyFileSync(`./network/codebase/tiddlers/GettingStarted.tid`,
				`${wikisDir}/${name}/tiddlers/GettingStarted.tid`);
			}
			// A wiki new to pocket-io
			if (!fs.existsSync(`${wikisDir}/${name}/tiddlers/$__plugins_poc2go_pocket-io.json`)) {
				fs.copyFileSync(`./network/codebase/tiddlers/$__favicon.ico.png.meta`,
					`${wikisDir}/${name}/tiddlers/$__favicon.ico.png.meta`);
				fs.copyFileSync(`./network/codebase/tiddlers/$__favicon.ico.png`,
					`${wikisDir}/${name}/tiddlers/$__favicon.ico.png`);
			}
		}
	})
}

function createWikiSettings(opts) {
	var webserverParams = opts.webserver.parameters.filter(params => /host=|port=/.test(params) === false);
	return {
		name: opts.name,
		folder: `${opts.wikisDir}/${opts.name}`,
		$tw: null,
		excludeLinks: false,
		webserver:  {
			host: opts.webserver.host,
			port: opts.webserverPort,
			filesDir: `${opts.wikisDir}/${opts.name}/files`,
			parameters: webserverParams
		},
		proxy: {
			domain: opts.proxy.domain,
			host: opts.proxy.host,
			port: opts.proxyPort,
			link: `http://${opts.proxy.domain}:${opts.proxyPort}`,
			targetUrl: `http://${opts.webserver.host}:${opts.webserverPort}`
		}
	}
}

exports.buildSettings = function buildSettings(config) {
	const { wikisDir, defaultWiki, forceCodebaseLocal, webserver, proxy } = config;
	var webserverPort = webserver.basePort;
	var proxyPort = proxy.basePort;

	verifyRequirements();

	var dirNames = fs.readdirSync(wikisDir, {withFileTypes: true})
			.filter(item => item.isDirectory())
			.map(item => item.name)

	// Insure Home exists and is first port
	if (dirNames.indexOf(defaultWiki) > -1) {
		dirNames.splice(dirNames.indexOf(defaultWiki), 1);
		dirNames.unshift(defaultWiki);
	} else {
		throw new Error(`Missing defualt wiki '${wikisDir}/${defaultWiki}' - see './config.js'`);
	}

	copyClientTiddlers(wikisDir, dirNames);

	const serverSettings = [];
	dirNames.forEach(name => {
		if (fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`)) {
			serverSettings.push(createWikiSettings({
				name, wikisDir, webserver, proxy, webserverPort, proxyPort
			}));
			webserverPort++;
			proxyPort++;
		}
	});

	// Add codebase wiki
	serverSettings.push(createWikiSettings({
		name:'codebase', wikisDir:'./network', webserver, proxy, webserverPort, proxyPort
	}));
	webserverPort++;
	proxyPort++;

	// Optionally force codebase only accessable from localhost browsers
	//  and for the most part excluded from lists of pocket-io wikis
	if (forceCodebaseLocal) {
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

	// Locate and set credentials
	serverSettings.forEach((settings, idx) => {
		const { name } = settings;
		if (fs.existsSync(`./network/credentials/${name}.csv`)) {
			serverSettings[idx].webserver.parameters =
				settings.webserver.parameters.concat(config.webserver.authorization);
			serverSettings[idx].webserver.parameters.push(
				`credentials=../../network/credentials/${name}.csv`
			)
		}
	})

	return serverSettings;
}
