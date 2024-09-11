var listenHook, listenServer, listenNodeServer, listenRestarted = '';
function twListen() {
  if (listenHook) {
    listenNodeServer.close();
    delete listenServer;
    delete listenNodeServer;
    log(hue('Server stopped', 70));
  } else {
    listenHook = (server, nodeServer) => {
      listenServer = server;
      listenNodeServer = nodeServer;
      log(hue(`Server ${listenRestarted}started`, 70));
      listenRestarted = 're';
    };
    $tw.hooks.addHook('th-server-command-post-start', listenHook);
  }
  new Promise((resolve) => {
    rt.setPrompt('');
    commander.execute($tw.wiki, ['--listen', `port=${twSyncPort}`]);
    setTimeout(() => {
      rt.write(`rt.setPrompt(hue(\`${twOutput} server:${twSyncPort}> \`,214))\n`);
      rt.displayPrompt(); }
      ,500);
  })
}
