"use strict";

const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));
const col = (nbr=40) => `\x1b[${nbr}G`;

const { hideStdout } = require('./hideStdout');

function wrap(str, cols) {
	var lines = [];
	for (let idx = cols;idx < str.length; idx++) {
		if (str.charAt(idx) === ' ') {
			lines.push(str.substring(0, idx))
			str = str.substring(idx+1);
			idx = cols;
		}
	}
	if (str.length) { lines.push(str); }
	return lines.join('\n');
}

// TW sync server startup
exports.TwSyncServer = function TwSyncServer($tw, settings) {
	var self = this;
	this.$tw = $tw;
	this.name = settings.name;
	this.host = '127.0.0.1';
	this.port = settings.webserver.port;
	this.parameters = settings.webserver.parameters,
	this.server;
	this.nodeServer;

	// TW Commander to execute commands
	this.commander = {
		checkForErrors: (err) => {
			if (err) {
				this.$tw.utils.error("Error: " + err);
			}
		},
		execute: (wiki, cmds) => {
			new this.$tw.Commander(cmds, this.commander.checkForErrors, wiki,
				{output: process.stdout, error: process.stderr})
			.execute();
		}
	}

	// TW hook let's us know when server is running
	this.hook = (server, nodeServer) => {
		const showStdout = hideStdout();
		self.server = server;
		self.nodeServer = nodeServer;
		// No obnoxious log messages
		self.$tw.syncer.logger.enable = false;
		// Release the thread so tiddlywiki can finish hook init
		setTimeout(() => {
			var address = self.nodeServer.address(),
				url = 'http://' + (address.family === 'IPv6' ? '[' + address.address + ']' : address.address) + ':' + address.port;
			showStdout();
			log(hue(` ${self.name}${col(15)}: `,76) + url.replace('127.0.0.1', 'localhost') + `/${self.name}`);
			self.resolveCaller(self.$tw);
		},10);
	};

	this.twListen = (resolveCaller) => {
		// The hook above resolves the promise when hook is ready
		this.resolveCaller = resolveCaller;
		this.$tw.hooks.addHook('th-server-command-post-start', this.hook);
		new Promise((resolve) => { // never resolved
			var cmds = ['--listen', `host=${this.host}`, `port=${this.port}`, `path-prefix=/${this.name}`];
			cmds = cmds.concat(this.parameters);
			// log(cmds);
			this.commander.execute(this.$tw.wiki, cmds);
		})
	}

	return this;
}

