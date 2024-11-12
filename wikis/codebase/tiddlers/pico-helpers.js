var log = (...args) => { console.log(...args); }
var hue = (txt, nbr = 214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
var cpy = (obj) => JSON.parse(JSON.stringify(obj));
