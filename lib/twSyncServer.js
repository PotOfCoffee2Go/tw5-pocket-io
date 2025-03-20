const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

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
	this.host = settings.webserver.host;
	this.port = settings.webserver.port;
	this.parameters = settings.webserver.parameters,
	this.server;
	this.nodeServer;
	this.restarted = '';

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
		self.server = server;
		self.nodeServer = nodeServer;
		const showStdout = hideStdout();
		self.$tw.syncer.logger.enable = false;
		setTimeout(() => {
			var address = self.nodeServer.address(),
				url = 'http://' + (address.family === 'IPv6' ? '[' + address.address + ']' : address.address) + ':' + address.port;
			showStdout();
			log(hue('Webserver ',76) +
				`'${self.$tw.boot.wikiPath.split('/').pop()}'` +
				hue(' serving on ',76) + url);
			if (self.parameters.length) {
				hog(wrap(self.parameters.join(' '),30),72);
			} else {
				hog('No webserver parameters or credentials assigned',156);
			}
			log(hue(`${self.$tw.boot.wikiPath}` +
				` $tw instance and webserver ${self.restarted}startup complete`,76));

			hog('');
			self.restarted = 're';
			self.resolveCaller(self.$tw);
		},500);
	};

	this.twListen = (resolveCaller) => {
		this.resolveCaller = resolveCaller;
		if (this.nodeServer) {
			this.nodeServer.close();
			delete this.server;
			delete this.nodeServer;
			console.log(`'${self.$tw.boot.wikiPath}' server stopped`);
		} else {
			this.$tw.hooks.addHook('th-server-command-post-start', this.hook);
		}
		new Promise((resolve) => { // never resolved
			var cmds = ['--listen', `host=${this.host}`, `port=${this.port}`];
			cmds = cmds.concat(this.parameters);
			this.commander.execute(this.$tw.wiki, cmds);
		})
	}

	return this;
}

