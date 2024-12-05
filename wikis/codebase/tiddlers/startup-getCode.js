// Get code from code (this!) wiki and updates REPL
// If an error displays on the server's console
$tpi.getCode = function replGetCode(filter, minify = true) {
	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	var byteCount = 0, hasErrors = false;
	hog(`Loading minified code tiddlers (application/javascript) to REPL ...`, 149);
	hog(`Filters:\n${' ' + filter.replace(/\]\]/g, ']]\n ')}`, 149);

	// Do not display the minified code being loaded to REPL
	$tpi.fn.hideStdout();
	$rt.write('.editor\n');
	$rt.write(`var Done = 'Load complete';\n`);
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	tiddlers.forEach(tiddler => {
		if (tiddler.type !== 'application/javascript') {
			$tpi.fn.showStdout();
			hog(`Tiddler '${tiddler.title}' bypassed - is not type application/javascript`, 163);
			$tpi.fn.hideStdout();
			return;
		}
		var codeText = { code: tiddler.text };
		if (minify) {
			codeText = UglifyJS.minify(codeText.code);
			if (codeText.error) {
				$tpi.fn.showStdout();
				hog(`Error processing tiddler: '${tiddler.title}'\n${minified.error}`,9);
				$tpi.fn.hideStdout();
				hasErrors = true;
				return;
			}
		}
		$tpi.fn.showStdout();
		$rt.write(codeText.code + '\n');
		hog(`Tiddler '${tiddler.title}' ${codeText.code.length} bytes`, 149);
		byteCount += codeText.code.length;
		$tpi.fn.hideStdout();
	})
	$rt.write('Done\n');
	$rt.write(null,{ctrl:true, name:'d'})
	$tpi.fn.showStdout();
	hog(`\n${tiddlers.length} code tiddlers loaded - ${(byteCount/1024).toFixed(3)}K bytes.`, 149);
	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);

	var result = `\n${tiddlers.length} code tiddlers loaded - ${(byteCount/1024).toFixed(3)}K bytes.`;
	hog(`\n${tiddlers.length} code tiddlers loaded - ${(byteCount/1024).toFixed(3)}K bytes.`, 149);
	return result;
}
