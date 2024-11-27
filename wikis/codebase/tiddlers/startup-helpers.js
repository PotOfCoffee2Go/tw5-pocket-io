// Copy a JS object and get last 12 digits of socket ID
// From REPL see - cog('startup-helpers writeup')
var cpy = (obj) => JSON.parse(JSON.stringify(obj));
var sid = (socket) => socket.id.split('-').pop();
