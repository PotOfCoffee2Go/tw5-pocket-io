const syncServerPath = twOutput;
var syncProcess, syncController;
const { spawn } = require('node:child_process');

// Start up the 'server' edition sync server at http://localhost:8080
function twSyncServer(startText = 'started') {
  return new Promise((resolve) => {
    // Initialize 'server' edition?
    if (!fs.existsSync(syncServerPath)) {
      commander.execute($tw.wiki, ['--init', 'server']);
      $tw.utils.createDirectory(`${syncServerPath}/tiddlers`);
    }
    twListen(startText);
    setTimeout(() => {resolve();}, 3000)
  })
}

// See https://tiddlywiki.com/static/ListenCommand.html
function twListen(startText, logging = 'no') {
  // Remove $:/StoryList tiddler(s) before restarting sync server
  fs.readdirSync(`${syncServerPath}/tiddlers`)
    .filter(f => /\$__StoryList_.*$/.test(f))
    .map(f => fs.unlinkSync(`${syncServerPath}/tiddlers/${f}`));
  // Turn off/on logging
  fs.writeFileSync(
    `${syncServerPath}/tiddlers/$__config_SyncLogging.tid`,
    `title: $:/config/SyncLogging\n\n${logging}\n`
  );

  // Signal to bounce the sync server
  syncController = new AbortController();
  const { signal } = syncController;

  // Fire up the sync server
  syncProcess = spawn('node_modules/tiddlywiki/tiddlywiki.js',
    [syncServerPath, '--listen'], { signal, stdio: 'inherit' });

  // When we abort the server - restart it
  twSyncRestart();
  wrt(`Sync server ${startText} - http://localhost:8080`);
  return 'Waiting for startup';
}

// Bounce the sync server
function twSyncRestart() {
  syncProcess.on('error', (err) => {
    if (err.code === 'ABORT_ERR') {
      setTimeout(() => {
        wrt(twListen('restarted'));
        setTimeout(() => {rt.displayPrompt();}, 3000);
      }, 1000);
    } else {
      wrt(`Sync server error: ${err.code}`);
    }
  });
  syncProcess.on('close', (err) => {
    wrt('Sync server stopped');
  });
}
