// cmd is assigned to REPL global context
// Shorthand used when typing commands into the REPL
//   generally, should not be used when coding functions
// In REPL ex: cmd.cog('A Tiddler Title')
const cmd = {
	cog: (title) => hog($cw.wiki.getTiddlerText(title),40),
	dog: (title) => hog($dw.wiki.getTiddlerText(title),39),
	lst: () => $dw.wiki.getTiddlers(),
	fld: (title) => $dw.wiki.getTiddler(title).fields,
	dxt: (title, txt) => $dw.wiki.setText(title,'text', null, txt),
	cxt: (title, txt) => $cw.wiki.setText(title,'text', null, txt),
	dad: (tiddler) => $dw.wiki.addTiddler(new $dw.Tiddler(tiddler)),
	cad: (tiddler) => $cw.wiki.addTiddler(new $cw.Tiddler(tiddler)),
	wrt: (obj) => log($rt.writer(obj))
}
