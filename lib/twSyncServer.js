// TW sync server startup
exports.twSyncServer = function (tw, host, port, resolveCaller) {
  self = this;
  this.tw = tw;
  this.host = host;
  this.port = port;
  this.resolveCaller = resolveCaller;
  this.server;
  this.nodeServer;
  this.restarted = '';

  //TW Commander to execute commands
	this.commander = {
		checkForErrors: (err) => {
			if (err) {
				this.tw.utils.error("Error: " + err);
			}
		},
		execute: (wiki, cmds) => {
			new this.tw.Commander(cmds, this.commander.checkForErrors, wiki,
				{output: process.stdout, error: process.stderr})
			.execute();
		}
	}

  // TW hook let's us know when server is running
  this.hook = (server, nodeServer) => {
    self.server = server;
    self.nodeServer = nodeServer;
    console.log(`'${self.tw.boot.wikiPath}' server ${self.restarted}started`);
    self.restarted = 're';
    self.tw.syncer.logger.enable=false;
    setTimeout(() => self.resolveCaller(),200);
  };

	this.checkDisconnect = () => {
    if (this.nodeServer) {
      this.nodeServer.close();
      delete this.server;
      delete this.nodeServer;
      console.log(`'${self.tw.boot.wikiPath}' server stopped`);
    }
    else {
			this.tw.hooks.addHook('th-server-command-post-start', this.hook);
		}
	}

	// Listen on requested port
  this.twListen = () => {
		this.checkDisconnect();
    new Promise((resolve) => {
      this.commander.execute(this.tw.wiki, ['--listen', `host=${this.host}`, `port=${this.port}`]);
    })
  }
  return this;
}

