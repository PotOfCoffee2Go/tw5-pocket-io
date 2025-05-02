// Build settings
"use strict";

const fs = require('fs-extra');
const path = require('node:path');
// Full filepath using the startup directory
const programDir = (fpath) => path.join(__dirname, '..', fpath);

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

function createWikiSettings(opts) {
	var webserverParams = opts.webserver.parameters.default;
	webserverParams = opts.credentials ?
		webserverParams.concat(opts.credentials.authorization) :
		webserverParams;
	return {
		name: opts.name,
		folder: path.join(opts.wikisDir, opts.name),
		excludeLinks: false,
		webserver:  {
			host: 'localhost',
			port: opts.webserverPort,
			filesDir: path.join(opts.wikisDir, opts.name, 'files'),
			parameters: webserverParams,
			credentials: opts.credentials
		},
		proxy: {
			// proxy fields are set when the proxy listens
			//  ./lib/pocketIoProxy.js
		},
		$tw: null
	}
}

exports.wikiSettings = function wikiSettings(config) {
	var { defaultWiki } = config;
	const { wikisDir, webserver } = config;
	const { verifyCodebase, copyClientTiddlers } = require('./verifyCodebase');
	const credentials = require('./credentials')(config);

	var webserverPort = webserver.basePort;

	verifyCodebase();

	var dirNames = fs.readdirSync(wikisDir, {withFileTypes: true})
			.filter(item => item.isDirectory())
			.map(item => item.name)

	// Replce spaces with '-' in wiki names
	dirNames.forEach((name, idx) => {
		if (/ +/.test(name)) {
			var newName = name.replace(/ /g, '-');
			fs.renameSync(path.resolve(wikisDir, name), path.resolve(wikisDir, newName))
			dirNames[idx] = newName;
		}	
	})

	// Insure default wiki exists and is first port
	if (dirNames.indexOf(defaultWiki) > -1) {
		dirNames.splice(dirNames.indexOf(defaultWiki), 1);
		dirNames.unshift(defaultWiki);
	} else {
		hog(`Missing default wiki '${wikisDir}/${defaultWiki}' - see 'config.js'`, 163);
		hog(`Default wiki set to wiki '${wikisDir}/${dirNames[0]}'`, 163);
		defaultWiki = dirNames[0];
	}

	copyClientTiddlers(wikisDir, dirNames);

	const serverSettings = [];
	dirNames.forEach(name => {
		if (fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`)) {
			serverSettings.push(createWikiSettings({
				name, wikisDir,
				webserver,
				webserverPort, 
				credentials: credentials[name],
			}));
			webserverPort++;
		}
	});

	// Add codebase wiki
	serverSettings.push(createWikiSettings({
		name:'codebase', wikisDir:programDir('network'),
		webserver, webserverPort, 
		credentials: credentials['codebase']
	}));

	return serverSettings;
}
