// These functions are REPL globals
// log, dir, and hog are used throughout the code
//  to display to the REPL console.
const log = (...args) => { console.log(...args); }
const dir = (property, depth = 0) => { console.dir(property, { depth }); }
const hue = (txt, nbr = 214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const tog = (txt, nbr = 44) => {
	var cursorPos = $rt.cursor;
	hog(tStamp() + txt, nbr);
	$rt.displayPrompt();
	$rt._moveCursor(cursorPos);
}
