// Build settings
const fs = require('node:fs');
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

const cbase = './network/codebase';
const cbaset = `${cbase}/tiddlers`;
const pmacro = `$__poc2go_macro_tw5-pocket-io_network.js`;
const pplugin = '$__plugins_poc2go_pocket-io.json';

function verifyRequirements() {
	if (!fs.existsSync(`${cbase}/tiddlywiki.info`)) {
		hog(`'server' edition wiki '${cbase}/tiddlywiki.info' is required!`, 9);
		process.exit(1);
	}
	if (!fs.existsSync(`${cbaset}/${pmacro}.meta`)) {
		hog(`'${cbaset}/${pmacro}.meta' is required!`, 9);
		process.exit(2);
	}
	if (!fs.existsSync(`${cbaset}/${pmacro}`)) {
		hog(`'${cbaset}/${pmacro}' is required!`, 9);
		process.exit(3);
	}
	if (!fs.existsSync(`${cbaset}/${pplugin}.meta`)) {
		hog(`'${cbaset}/${pplugin}.meta' is required!`, 9);
		process.exit(4);
	}
	if (!fs.existsSync(`${cbaset}/${pplugin}`)) {
		hog(`'${cbaset}/${pplugin}' is required!`, 9);
		process.exit(5);
	}
}

function verifyWikiName(wikisDir, name) {
	if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(name)) {
		hog(`'server' edition directory '${wikisDir}/${name}' ` +
			`name must be a valid JavaScript variable name`,9);
		process.exit(6);
	}
}

function copyClientTiddlers(wikisDir, dirNames) {
	dirNames.forEach(name => {
		if (name === 'codebase') { return; } // skip codebase
		verifyWikiName(wikisDir, name);
		if (fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`)) {
			// Pocket-io macro
			fs.copyFileSync(`${cbaset}/${pmacro}.meta`,
				`${wikisDir}/${name}/tiddlers/${pmacro}.meta`);
			fs.copyFileSync(`${cbaset}/${pmacro}`,
				`${wikisDir}/${name}/tiddlers/${pmacro}`);
			// Pocket-io plugin
			fs.copyFileSync(`${cbaset}/${pplugin}.meta`,
				`${wikisDir}/${name}/tiddlers/${pplugin}.meta`);
			fs.copyFileSync(`${cbaset}/${pplugin}`,
				`${wikisDir}/${name}/tiddlers/${pplugin}`);
			if (!fs.existsSync(`${wikisDir}/${name}/tiddlers/$__SplashScreen.tid`)) {
				fs.copyFileSync(`${cbaset}/$__SplashScreen.tid`,
				`${wikisDir}/${name}/tiddlers/$__SplashScreen.tid`);
				fs.copyFileSync(`${cbaset}/GettingStarted.tid`,
				`${wikisDir}/${name}/tiddlers/GettingStarted.tid`);
			}

			// A wiki new to pocket-io ?
			//  not happy with this - needs improvement
			if (!fs.existsSync(`${wikisDir}/${name}/tiddlers/${pplugin}`)) {
				fs.copyFileSync(`${cbaset}/$__favicon.ico.png.meta`,
					`${wikisDir}/${name}/tiddlers/$__favicon.ico.png.meta`);
				fs.copyFileSync(`${cbaset}/$__favicon.ico.png`,
					`${wikisDir}/${name}/tiddlers/$__favicon.ico.png`);
			}
		}
	})
}

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
	const { wikisDir, defaultWiki, forceCodebaseLocal, webserver, proxy, parameters } = config;
	const credentials = require('./credentials')(config);
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

	return serverSettings;
}
