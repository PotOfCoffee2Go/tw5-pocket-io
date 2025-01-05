// These are all assigned to REPL global context

// External packages
// Minify code
const UglifyJS = require('uglify-js');

// Helpers
// Copy a JS object
// Get last 12 digits of socket ID
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const sid = (socket) => socket.id.split('-').pop();

const get$settings = (name) => $ss.find(settings => settings.name === name) ?? {};
const get$tw = (name) => get$settings(name).$tw;
const get$proxy = (name) => get$settings(name).proxy ?? {};
const get$server = (name) => get$proxy(name).server ?? {};
const get$router = (name) => get$server(name).router ?? {};
const get$pocketio = (name) => get$server(name).pocketio ?? {};
