// These are all assigned to REPL global context
//  Will error 'Identifier '...' has already been declared'
//    if already assigned

// External packages 

// Minify code
const UglifyJS = require('uglify-js');

// Helpers
// Copy a JS object
// Get last 12 digits of socket ID
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const sid = (socket) => socket.id.split('-').pop();
