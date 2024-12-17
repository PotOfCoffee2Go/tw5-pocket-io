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

	var byteCount = 0, hasErrors = false;
	hog(`Loading minified code tiddlers (application/javascript)\n from $code wiki to REPL:`, 149);
	hog(`Autoload requested for tiddlers:\n${' ' + filter.replace(/\]\]/g, ']]\n ')}`, 149);

	// Do not display the minified code being loaded to REPL
	var showStdout = hideStdout();
	$rt.write('.editor\n');
	$rt.write(`var Done = 'Load complete';\n`);
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	tiddlers.forEach(tiddler => {
		if (tiddler.type !== 'application/javascript') {
			showStdout()
			hog(`Tiddler '${tiddler.title}' bypassed - is not type application/javascript`, 163);
			hideStdout();
			return;
		}
		var minified = UglifyJS.minify(tiddler.text);
		if (minified.error) {
			showStdout();
			hog(`Error processing tiddler: '${tiddler.title}'\n${minified.error}`,9);
			hideStdout();
			hasErrors = true;
			return;
		}
		$rt.write(minified.code + '\n');
		showStdout();
		hog(`Tiddler '${tiddler.title}' ${minified.code.length} bytes`, 149);
		byteCount += minified.code.length;
		hideStdout();
	})
	$rt.write('Done\n');
	$rt.write(null,{ctrl:true, name:'d'})
	showStdout();

	hog(`\n${tiddlers.length} code tiddlers loaded - ${(byteCount/1024).toFixed(3)}K bytes.`, 149);
	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);

	return hasErrors;
}
