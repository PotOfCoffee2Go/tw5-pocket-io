const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

const { hideStdout } = require('./hideStdout');

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
			showStdout();
			log(hue(`'${self.$tw.boot.wikiPath}'`,185) + ` - $tw instance and webserver ${self.restarted}started`);
			if (self.parameters.length) {
				console.dir(self.parameters.join(' '));
			} else {
				console.dir('No webserver parameters or credentials assigned');
			}

			var address = self.nodeServer.address(),
				url = 'http://' + (address.family === 'IPv6' ? '[' + address.address + ']' : address.address) + ':' + address.port;
			hog('serving on ' + url + '\n', 185);
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

