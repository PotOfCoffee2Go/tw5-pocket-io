// log, dir, and hog are used throughout the code
//  to display on the console.
// From REPL see - cog('startup-console writeup')
var log = (...args) => { console.log(...args); }
var dir = (property, depth = 0) => { console.dir(property, { depth }); }
var hue = (txt, nbr = 214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
var hog = (txt, nbr) => log(hue(txt, nbr));

// Rarely used
// Submit text into REPL as if it was typed
//  command  - sub('command\n');
//  keypress - ctrl-d = sub(null, {ctrl: true, name: 'd'});
var sub = (cmd, key) => {
	process.nextTick(() => {
		$rt.write(cmd, key);
	});
}

