// Get code from codebase wiki into the REPL
// This function is also in server.js for initial
//   load on startup
// A copy is in $Code database [[startup-getCode]]
//   for use once system has been loaded
function getCode(filter) {
	const prevHistory = cpy(rt.history);
	const prevPrompt = rt.getPrompt(); rt.setPrompt('');

	var parser = $cw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');

	var tidCount = 0, errList = [];
	log(hue(`Loading ${filter} code tiddlers to server ...`,149));
	rt.write('.editor\n');
	rt.write(`var Done = 'Load complete';\n`);
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		var widgetNode = $cw.wiki.makeWidget(parser,
			{variables: $cw.utils.extend({},
				{currentTiddler: title, storyTiddler: title})
			}
		);
		var container = $cw.fakeDocument.createElement("div");
		widgetNode.render(container,null);
		var tiddlerText = container.textContent;
		var minified = UglifyJS.minify(tiddlerText);
		if (minified.error) {
			errList.push(hue(`Error processing code tiddler: '${title}'\n${minified.error}`,9));
		} else {
			log(hue(`\nTiddler '${title}'`, 149));
			rt.write(minified.code + '\n');
			tidCount++;
		}
	})
	rt.write('Done\n');
	rt.write(null,{ctrl:true, name:'d'})
	log(hue(`Code loaded from $code database\n${filter}\n${tidCount} code tiddlers loaded.`, 149));
	rt.history = prevHistory;
	rt.setPrompt(prevPrompt);
	errList.forEach(err => {
		log(err);
	})
	if (errList.length) {process.exit(1);}
}
