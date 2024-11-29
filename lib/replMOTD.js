const log = (...args) => {console.log(...args);};
const hue = (txt, nbr=40) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

exports.replMOTD = function replMOTD($rt) {
	hog(`Welcome to TW5-pocket-io\n`);
	hog(`This REPL has access to the complete system:`);
	hog(`$rt = the runtime instance of this REPL`);
	hog(`$dw = data tiddlywiki instance ex: $dw.wiki.filterTiddlers('[tags[]]')`);
	hog(`$cw = code tiddlywiki instance ex: $cw.wiki.filterTiddlers('[tags[]]')`);
	hog(`$tw = REPL tiddlywiki instance ex: $tw.version`);
	hog(`$data = Pocket.io socket & proxy server to the data wiki - http://localhost:3000`);
	hog(`$code = Pocket.io socket & proxy server to the code wiki - http://localhost:3001`);
	hog('');
	hog(`Type one of above followed by '.' (period) and press {tab} twice:`);
	hog(` ex: $data.{tab}{tab}`);
	hog(`will display the properties of the data wiki proxy server.`);
	hog('');
	hog(`Type: cmd.cog('REPL-MOTD-MSG') for more info.`);
	hog('  Is in the command history - just press up-arrow then enter.');
	hog('');
	$rt.history.push(`cmd.cog('REPL-MOTD-MSG')`);
	$rt.history.push(`$data.`);
}
