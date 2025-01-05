// These are all assigned to REPL global context

// External packages
// Minify code
const UglifyJS = require('uglify-js');

// Helpers
// Copy a JS object
// Get last 12 digits of socket ID
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const sid = (socket) => socket.id.split('-').pop();
const get$tw = (name) => ($ss.find(obj => obj.name === name) ?? {$tw: $rw}).$tw;
const get$proxy = (name) => ($ss.find(obj => obj.name === name) ?? {proxy:{server:{}}}).proxy.server;
