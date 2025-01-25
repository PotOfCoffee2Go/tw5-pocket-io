// Build settings
const fs = require('node:fs');
const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

function verifyRequirements(wikisDir) {
	if (!fs.existsSync(`${wikisDir}/codebase/tiddlywiki.info`)) {
		hog(`'server' edition wiki '${wikisDir}/codebase/tiddlywiki.info' is required!`, 9);
		process.exit(1);
	}
	if (!fs.existsSync(`${wikisDir}/codebase/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js.meta`)) {
		hog(`'${wikisDir}/codebase/tiddler$__poc2go_macro_tw5-pocket-io_network.js.meta' is required!`, 9);
		process.exit(2);
	}
	if (!fs.existsSync(`${wikisDir}/codebase/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js`)) {
		hog(`'${wikisDir}/codebase/tiddler$__poc2go_macro_tw5-pocket-io_network.js' is required!`, 9);
		process.exit(3);
	}
}

function verifyWikiName(wikisDir, name) {
	if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(name)) {
		hog(`'server' edition directory '${wikisDir}/${name}' name must be a valid JavaScript variable name`,9);
		process.exit(4);
	}
}

function copyclientMacro(wikisDir, dirNames) {
	dirNames.forEach(name => {
		if (name === 'codebase') { return; } // skip codebase
		verifyWikiName(wikisDir, name);
		if (fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`)) {
			fs.copyFileSync(`${wikisDir}/codebase/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js.meta`,
				`${wikisDir}/${name}/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js.meta`);
			fs.copyFileSync(`${wikisDir}/codebase/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js`,
				`${wikisDir}/${name}/tiddlers/$__poc2go_macro_tw5-pocket-io_network.js`);
			if (!fs.existsSync(`${wikisDir}/${name}/tiddlers/$__SplashScreen.tid`)) {
				fs.copyFileSync(`${wikisDir}/codebase/tiddlers/$__SplashScreen.tid`,
				`${wikisDir}/${name}/tiddlers/$__SplashScreen.tid`);
			}
		}
	})
}

exports.buildSettings = function buildSettings(config) {
	const { wikisDir, webserver, proxy } = config;
	var webserverPort = webserver.basePort;
	var proxyPort = proxy.basePort;

	verifyRequirements(wikisDir);

	var dirNames = fs.readdirSync(wikisDir, {withFileTypes: true})
			.filter(item => item.isDirectory())
			.map(item => item.name)

	// Insure _GettingStarted exists and is first port
	if (dirNames.indexOf('GettingStarted') > -1) {
		dirNames.splice(dirNames.indexOf('GettingStarted'), 1);
		dirNames.unshift('GettingStarted');
	} else {
		throw new Error(`Missing wiki '${wikisDir}/GettingStarted' that comes with the GitHub project'`);
	}

	copyclientMacro(wikisDir, dirNames);

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
					link: `http://${proxy.domain}:${proxyPort}`,
					targetUrl: `http://${webserver.host}:${webserverPort}`
				}
			});
			webserverPort++;
			proxyPort++;
		}
	});

	return serverSettings;
}
