#!/usr/bin/env node

const process = require('node:process');
const path = require('node:path');

process.cwd(path.resolve('../'));

require('../servers.js');
