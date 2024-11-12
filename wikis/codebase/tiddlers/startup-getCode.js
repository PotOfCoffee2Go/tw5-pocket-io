// ----------------------
// Get code from codebase wiki into the REPL
/*
Note: This code is an identical copy of the getCode() function
   in './server.js' used for initial code loading on startup.
   If changing here - will probably also want to change there too.
*/
function getCode(filter) {
	const prevHistory = cpy(rt.history);
	const prevPrompt = rt.getPrompt(); rt.setPrompt('');

	var parser = $cw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');

	var tidCount = 0, errList = [];
	log(hue(`Loading ${filter} code tiddlers to server ...`,149));
	rt.write('.editor\n');
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
			log(hue(`\n${title}`, 149));
			rt.write(minified.code + '\n');
			tidCount++;
		}
	})
	rt.write(`\n'$code database ${filter} --> ${tidCount} code tiddlers loaded'\n`);
	rt.write(null,{ctrl:true, name:'d'})
	rt.history = prevHistory;
	rt.setPrompt(prevPrompt);
	errList.forEach(err => {
		log(err);
	})
	if (errList.length) {process.exit(1);}
}
