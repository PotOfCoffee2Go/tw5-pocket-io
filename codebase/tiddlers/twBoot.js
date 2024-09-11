var $tw;
function twBoot(twOutput = 'pocket-io') {
  return new Promise((resolve) => {
    $tw = require('tiddlywiki').TiddlyWiki();
    // $tw.preloadTiddlers = require('./preloadTiddlers.json');
    $tw.boot.argv = [twOutput]; // TW output path
    $tw.boot.boot(() => { resolve(`TW v${$tw.version}`); });
  })
}
