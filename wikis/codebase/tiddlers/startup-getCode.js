// Get code from code (this!) wiki and updates REPL
// If an error - displays on the server's console
$tpi.getCode = function replGetCode(wikiName, $cw, filter, minify = true) {
	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	var byteCount = 0, hasErrors = false, hssErrorText = [];
	hog(`\nLoading code tiddlers from wiki '${wikiName}' to REPL ...`, 149);
	hog(`Filters:\n${' ' + filter.replace(/\]\]/g, ']]\n ')}`, 149);

	// Do not display the minified code being loaded to REPL
	$tpi.fn.hideStdout();
	$rt.write('.editor\n');
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
				hssErrorText.push(`Error minifying tiddler: '${tiddler.title}'\n${codeText.error}`);
				$tpi.fn.hideStdout();
				hasErrors = true;
				return;
			}
		}
		// Set $rt.lastError to '[Error: Reset - for load]'
		$rt.write('throw new Error("Reset - for load")\n');
		$tpi.fn.showStdout();
		hog(`\nTiddler '${tiddler.title}' ${codeText.code.length} bytes`, 149);
		$rt.write(codeText.code + '\n');
		//		process.stdin.write(codeText.code + '\n');
		byteCount += codeText.code.length;
		$tpi.fn.hideStdout();
	})
	$rt.write(null,{ctrl:true, name:'d'})
	$tpi.fn.showStdout();

	var result = '';
	if (hasErrors) {
		result = hssErrorText.join('\n');
		hog(result,9);		
	}
	else if ($rt.lastError && $rt.lastError.toString() !== 'Error: Reset - for load') {
		if (tiddlers.length === 1) {
			result = `Error uploading tiddler '${tiddlers[0].title}': @@ ${$rt.lastError} @@`;
			hog(result,9);
		} else {
			result = `Error uploading tiddlers: @@ ${$rt.lastError} @@`;
			hog(result,9);
		}
	} else {
		if (tiddlers.length === 1) {
			result = `Tiddler '${tiddlers[0].title}' uploaded - ${(byteCount/1024).toFixed(3)}K bytes.`;
			hog(result);
		} else {
			result = `${tiddlers.length} code tiddlers uploaded - ${(byteCount/1024).toFixed(3)}K bytes.`;
		hog(result);
		}
	}
	
	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);
	$rt.displayPrompt();
	return result;
}
