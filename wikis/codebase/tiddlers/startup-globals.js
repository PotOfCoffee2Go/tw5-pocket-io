// From REPL see - cog('startup-globals writeup')
var $sockets = {}; // SocketIds of clients connected to server
var $topics = {};  // Topics implemented on server

// External packages - for example:
//  From console window in the tw5-pocket-io project directory:
//    npm install uglify-js --save
//  Then 'require' here
// Minify code
var UglifyJS = require('uglify-js');

// Already defined on tw5-pocket-io startup
// $rt = the REPL runtime instance
// $dw = data tiddlywiki instance ex: $dw.wiki.filterTiddlers('[tags[]]')
// $cw = code (this!) tiddlywiki instance ex: $cw.wiki.filterTiddlers('[tags[]]')
// $tw = REPL's tiddlywiki instance ex: $tw.version
// $data = Pocket.io express proxy server to the TW Data wiki - http://localhost:3000
// $code = Pocket.io express proxy server to the TW Code wiki - http://localhost:3001
