// These are all assigned to REPL global context
//  Will error 'Identifier '...' has already been declared'
//    if already assigned

// Code to the REPL loaded by this wiki
const $tpi = { fn: {}, topic: {} }

// External packages 

// Express server and middleware
const express = require('express');
const cors = require('cors');
const pocketio = require('pocket.io');
const httpProxy = require('http-proxy');

// Minify code
const UglifyJS = require('uglify-js');

// Helpers
// Copy a JS object
// Get last 12 digits of socket ID
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const sid = (socket) => socket.id.split('-').pop();
