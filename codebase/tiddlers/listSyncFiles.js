function listSyncFiles() {
  try {
  fs.readdirSync(twOutput + '/tiddlers')
    .forEach(file => { wrt(file); } )
  } catch(err) {
    wrt(`list error: ${err.code}`);
  }
}
