const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const cpy = (obj) => JSON.parse(JSON.stringify(obj));

// Get code from code wiki into the REPL
// A modified  copy is in code wiki 'startup' project [[startup-getCode]]
const UglifyJS = require('uglify-js'); // Code minify
const { hideStdout } = require('./hideStdout');

exports.replGetCode = function replGetCode($rt, $cw, filter) {
	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	var tidList = [], errList = [], byteCount = 0;
	hog(`Loading minified code tiddlers (application/javascript) to REPL ...`, 149);
	hog(`Filters:\n${' ' + filter.replace(/\]\]/g, ']]\n ')}`, 149);

	// Do not display the minified code being loaded to REPL
	var showStdout = hideStdout();
	$rt.write('.editor\n');
	$rt.write(`var Done = 'Load complete';\n`);
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	tiddlers.forEach(tiddler => {
		if (!tiddler.type) {
			tiddler.type = 'text/vnd.tiddlywiki';
		}
		if (tiddler.type === 'application/javascript') {
			var minified = UglifyJS.minify(tiddler.text);
			if (minified.error) {
				errList.push(hue(`Error processing code tiddler: '${tiddler.title}'\n${minified.error}`,9));
			} else {
				showStdout();
				hog(`Tiddler '${tiddler.title}' ${minified.code.length} bytes`, 149);
				byteCount += minified.code.length;
				hideStdout();
				$rt.write(minified.code + '\n');
				tidList.push(`[[${tiddler.title}]]`);
			}
		} else {
			showStdout();
			hog(`Tiddler '${tiddler.title}' bypassed, is type: ${tiddler.type}`, 163);
			hideStdout();
		}
	})
	$rt.write('Done\n');
	$rt.write(null,{ctrl:true, name:'d'})
	showStdout();

	hog(`\n${tidList.length} code tiddlers loaded - ${(byteCount/1024).toFixed(3)}K bytes.`, 149);
	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);
	errList.forEach(err => {
		log(err);
	})
	if (errList.length) {
		process.exit(1);
	}
}
