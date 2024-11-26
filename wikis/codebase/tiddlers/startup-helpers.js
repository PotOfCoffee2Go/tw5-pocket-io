var log = (...args) => { console.log(...args); }
var dir = (property, depth = 0) => { console.dir(property, { depth }); }
var cpy = (obj) => JSON.parse(JSON.stringify(obj));
var hue = (txt, nbr = 214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
var wrt = (obj) => log(rt.writer(obj));
var add = (tiddler) => $data.addTiddler(new $dw.Tiddler(tiddler));
var lst = () => $dw.wiki.getTiddlers();
var fld = (title) => $dw.wiki.getTiddler(title).fields;
var sid = (socket) => socket.id.split('-').pop();
var cog = (txt) => log(hue($cw.wiki.getTiddlerText(txt),40));
var dog = (txt) => log(hue($dw.wiki.getTiddlerText(txt),39));

var ask = (query, cb = (a) => wrt(a)) => {
	rt.question(query, (ans) => {
		cb(ans);
		rt.displayPrompt();
	});
}

// Submit text to REPL
//  keypress - ctrl-c = sub(null, {ctrl: true, name: 'c'})
var sub = (cmd, key) => {
	process.nextTick(() => {
		rt.write(cmd, key);
	});
}
