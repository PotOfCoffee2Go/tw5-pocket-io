// TW sync server startup
exports.twSyncServer = function (tw, host, port, resolveCaller) {
  var syncServer = this;
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
    syncServer.server = server;
    syncServer.nodeServer = nodeServer;
    console.log(`'${syncServer.tw.boot.wikiPath}' server ${syncServer.restarted}started`);
    syncServer.restarted = 're';
    syncServer.tw.syncer.logger.enable=false;
    setTimeout(() => syncServer.resolveCaller(),200);
  };

	this.checkDisconnect = () => {
    if (this.nodeServer) {
      this.nodeServer.close();
      delete this.server;
      delete this.nodeServer;
      console.log(`'${syncServer.tw.boot.wikiPath}' server stopped`);
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

