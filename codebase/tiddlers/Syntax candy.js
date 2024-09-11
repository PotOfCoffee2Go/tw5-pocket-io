const log = (...args) => {console.log(...args);}
const dbg = (property, depth=0) => {console.dir(property, {depth});}
const hue = (txt, nbr=27) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const wrt = (obj) => log(rt.writer(obj));
const ask = (query, cb = (a) => wrt(a)) => { rt.question(query, (ans) => { cb(ans);rt.displayPrompt(); }); return;}
