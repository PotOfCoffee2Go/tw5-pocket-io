var log = (...args) => {
	console.log(...args);
}
var dir = (property, depth = 0) => {
	console.dir(property, {
		depth
	});
}
var cpy = (obj) => JSON.parse(JSON.stringify(obj));
var hue = (txt, nbr = 214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
var wrt = (obj) => log(rt.writer(obj));
var ask = (query, cb = (a) => wrt(a)) => {
	rt.question(query, (ans) => {
		cb(ans);
		rt.displayPrompt();
	});
}
var add = (tiddler) => $data.addTiddler(new $dw.Tiddler(tiddler));
var lst = () => $data.getTiddlers();
var fld = (tiddler) => $data.getTiddler(tiddler).fields;
var sid = (socket) => socket.id.split('-').pop();
var sub = (cmd, key) => { // sub key - ctrl-c = sub(null, {ctrl: true, name: 'c'})
	process.nextTick(() => {
		rt.write(cmd, key);
	});
}
