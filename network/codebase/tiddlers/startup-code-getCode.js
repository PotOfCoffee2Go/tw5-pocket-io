// Get code from wiki tiddlers matching filter and updates 
//  the REPL context with the code
// If an error - displays on the server's console
$tpi.getCode = function (wikiName, $cw, filter, minify = true) {
	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt();
	$rt.setPrompt('');

	var byteCount = 0, hasErrors = false, hssErrorText = [];
	hog(`${tStamp()}Loading code tiddlers from wiki '${wikiName}' to REPL ...`, 44);
	hog(`Filters:\n${' ' + filter.replace(/\]\]/g, ']]\n ')}`, 149);

	// Do not display the minified code being loaded to REPL
	$tpi.fn.hideStdout();
	// Reset the REPL
	$rt.write(null,{ctrl:true, name:'c'})
	// Set $rt.lastError to '[Error: Reset - for load]'
	$rt.write('throw new Error("Reset - for load")\n');
	$rt.write('.editor\n');
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	tiddlers.forEach(tiddler => {
		if (tiddler.type !== 'application/javascript') {
			$tpi.fn.showStdout();
			hog(`Tiddler '${tiddler.title}' bypassed - is not type application/javascript`, 163);
			$tpi.fn.hideStdout();
			return; // continue with next forEach
		}
		var codeText = { code: tiddler.text };
		if (minify) {
			codeText = UglifyJS.minify(codeText.code);
			if (codeText.error) {
				$tpi.fn.showStdout();
				hssErrorText.push(`Error minifying tiddler: '${tiddler.title}'\n${codeText.error}`);
				$tpi.fn.hideStdout();
				hasErrors = true;
				return; // continue with next forEach
			}
		}
		$tpi.fn.showStdout();
		hog(`Tiddler '${tiddler.title}'`, 149);
		$rt.write(codeText.code + '\n');
		//		process.stdin.write(codeText.code + '\n');
		byteCount += codeText.code.length;
		$tpi.fn.hideStdout();
	})
	$rt.write(null,{ctrl:true, name:'d'})
	$tpi.fn.showStdout();
	$rt.setPrompt(prevPrompt);
	$rt.displayPrompt();

	var result = '';
	if (hasErrors) {
		result = hssErrorText.join('\n');
		tog(result,9);		
	}
	else if ($rt.lastError && $rt.lastError.toString() !== 'Error: Reset - for load') {
		if (tiddlers.length === 1) {
			result = `Error uploading tiddler '${tiddlers[0].title}': @@ ${$rt.lastError} @@`;
			tog(result,9);
		} else {
			result = `Error uploading tiddlers: @@ ${$rt.lastError} @@`;
			tog(result,9);
		}
	} else {
		if (tiddlers.length === 1) {
			result = `Tiddler '${tiddlers[0].title}' uploaded - ${(byteCount/1024).toFixed(3)}K bytes.`;
			tog(result, 44);
		} else {
			result = `${tiddlers.length} code tiddlers uploaded - ${(byteCount/1024).toFixed(3)}K bytes.`;
		tog(result, 44);
		}
	}
	
	$rt.history = prevHistory;
	$rt.displayPrompt();
	return result;
}
