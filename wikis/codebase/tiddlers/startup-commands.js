// Shorthand used when typing commands into the REPL
//   should not be used when coding functions
// From REPL see - cog('startup-commands writeup')
var wrt = (obj) => log($rt.writer(obj));
var cog = (title) => hog($cw.wiki.getTiddlerText(title),40);
var dog = (title) => hog($dw.wiki.getTiddlerText(title),39);
var lst = () => $dw.wiki.getTiddlers();
var fld = (title) => $dw.wiki.getTiddler(title).fields;
var dxt = (title, txt) => $dw.wiki.setText(title,'text', null, txt);
var cxt = (title, txt) => $cw.wiki.setText(title,'text', null, txt);
var dad = (tiddler) => $dw.wiki.addTiddler(new $dw.Tiddler(tiddler));
var cad = (tiddler) => $cw.wiki.addTiddler(new $cw.Tiddler(tiddler));
