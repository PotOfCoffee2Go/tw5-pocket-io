// Get code from code (this!) wiki and updates REPL
// If an error displays on the server's console
$tpi.getCode = function getCode(filter, minify = true) {
	const prevHistory = cpy($rt.history);
	const prevPrompt = $rt.getPrompt(); $rt.setPrompt('');

	var tidList = [], errList = [];
	hog(`Loading ${filter} code tiddlers to server ...`,149);
	$rt.write('.editor\n');
	$rt.write(`var Done = 'Load complete';\n`);
	var tiddlers = JSON.parse($cw.wiki.getTiddlersAsJson(filter));
	tiddlers.forEach(tiddler => {
		hog(`\nTiddler '${tiddler.title}'`, 149);
		if (minify) {
			var minified = UglifyJS.minify(tiddler.text);
			if (minified.error) {
				errList.push(hue(`Error processing code tiddler: '${tiddler.title}'\n${minified.error}`,9));
			} else {
				$rt.write(minified.code + '\n');
			}
		} else {
			$rt.write(tiddler.text.replace(/\t/gy, " ") + '\n');
		}
		tidList.push(`[[${tiddler.title}]]`);
	})
	$rt.write('Done\n');
	$rt.write(null,{ctrl:true, name:'d'})
	var result = `${minify ? 'Minified c' : 'C'}ode loaded from $code database: \`${filter}\`\n\n${tidList.join(', ')}\n\n${tidList.length} code tiddler${tidList.length === 1 ? '' : 's'} loaded.`

	hog(result.replace(/\n\n/g, '\n'), 149);

	$rt.history = prevHistory;
	$rt.setPrompt(prevPrompt);
	$rt.displayPrompt();

	errList.forEach(err => { log(err); })
	if (errList.length) {process.exit(1);}

	return result;
}
