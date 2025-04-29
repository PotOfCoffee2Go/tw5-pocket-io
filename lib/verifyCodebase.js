const fs = require('node:fs');
const path = require('node:path');

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const programDir = (fpath) => path.join(__dirname, '..', fpath);

const cbase = programDir('network/codebase');

const cbaset = `${cbase}/tiddlers`;
const pmacro = `$__poc2go_macro_tw5-pocket-io_network.js`;
const pplugin = '$__plugins_poc2go_pocket-io.json';

function verifyWikiName(wikisDir, name) {
	if (!/^[$A-Z_][0-9A-Z_$-]*$/i.test(name)) {
		hog(`'server' edition directory '${wikisDir}/${name}' ` +
			`name must be a valid JavaScript variable name`,9);
		process.exit(6);
	}
}

exports.verifyCodebase = function verifyCodebase() {
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

exports.copyClientTiddlers = function copyClientTiddlers(wikisDir, dirNames) {
	dirNames.forEach(name => {
		if (name === 'codebase') { return; } // skip codebase (it is the source)
		verifyWikiName(wikisDir, name);
		if (fs.existsSync(`${wikisDir}/${name}/tiddlywiki.info`)) {
			if (!fs.existsSync(`${wikisDir}/${name}/tiddlers`)) {
				// Insure have a tiddlers subdirectory
				try {
					fs.mkdirSync(`${wikisDir}/${name}/tiddlers`);
				} catch(e) {};
			}
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
			/* For now do not update new wikis - is over-the-top
			if (!fs.existsSync(`${wikisDir}/${name}/tiddlers/$__SplashScreen.tid`)) {
				fs.copyFileSync(`${cbaset}/$__SplashScreen.tid`,
				`${wikisDir}/${name}/tiddlers/$__SplashScreen.tid`);
				fs.copyFileSync(`${cbaset}/GettingStarted.tid`,
				`${wikisDir}/${name}/tiddlers/GettingStarted.tid`);
			}
			*/
		}
	})
}
