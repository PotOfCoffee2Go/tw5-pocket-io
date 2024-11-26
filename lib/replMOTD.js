const log = (...args) => {console.log(...args);};
const hue = (txt, nbr=40) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt) => log(hue(txt));

exports.replMOTD = function replMOTD(rt) {
	hog(`$dw = $data tiddlywiki instance ex: $dw.wiki.filterTiddlers('[tags[]]')`);
	hog(`$cw = $code tiddlywiki instance ex: $cw.wiki.filterTiddlers('[tags[]]')`);
	hog(`$tw = REPL  tiddlywiki instance ex: $tw.version`);
	hog(`$data = Pocket.io Proxy server to the TW Data wiki`);
	hog(`$code = Pocket.io proxy server to the TW Code wiki`);
	hog('');
	hog(`type: log(hue($cw.wiki.getTiddlerText('REPL-MOTD-MSG'), 40)) for more info.`);
	hog('   or better yet - just press up-arrow then enter.');
	rt.history.push(`log(hue($cw.wiki.getTiddlerText('REPL-MOTD-MSG'), 40))`);
}
