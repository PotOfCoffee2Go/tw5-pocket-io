// These are all assigned to REPL global context
// 'Identifier '...' has already been declared'
//     error will occur if already assigned

// Already assigned by ./server.js
// $rt = the REPL runtime instance
// $dw = data tiddlywiki instance ex: $dw.wiki.filterTiddlers('[tags[]]')
// $cw = code (this!) tiddlywiki instance ex: $cw.wiki.filterTiddlers('[tags[]]')
// $tw = REPL's tiddlywiki instance ex: $tw.version
// $data = Pocket.io express proxy server to the TW Data wiki - http://localhost:3000
// $code = Pocket.io express proxy server to the TW Code wiki - http://localhost:3001

// REPL commands 'cmd' - see [[startup-commands]]
// REPL console - see [[startup-console]]

// Copy a JS object and get last 12 digits of socket ID
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const sid = (socket) => socket.id.split('-').pop();

const $tpi = { fn: {}, topic: {} }
const $sockets = {}; // SocketIds of clients connected to server
const $topics = {};  // Topics implemented on server

// Express server
const express = require('express');
const cors = require('cors');
const io = require('pocket.io');
const httpProxy = require('http-proxy');

// External packages - for example:
//  From console window in the tw5-pocket-io project directory:
//    npm install uglify-js --save
//  Then 'require' here
// Minify code
const UglifyJS = require('uglify-js');
