function syncPut(tiddler) {
  const options = {
    method: 'PUT',
    host: listenServer.variables.host,
    port: listenServer.variables.port,
    path: encodeURI(`/recipes/default/tiddlers/${tiddler.title}`),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Requested-With': 'TiddlyWiki'
    }
  };

  const request = http.request(options, (res) => {
    if (res.statusCode !== 204) {
      log(hue(`Failed to update '${tiddler.title}'. Code: ${res.statusCode}`,9));
      res.resume();
      return;
    }
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('close', () => {
      log('');wrt(`Updated tiddler '${tiddler.title}'`);rt.displayPrompt();
    });
  });
  var now = $tw.utils.stringifyDate(new Date());
  var sendTiddler = Object.assign( {created: now}, tiddler, {modified: now} );
  request.write(JSON.stringify(sendTiddler));
  request.end();
  request.on('error', (err) => {
    wrt(`Encountered an error trying to make a request: ${err.message}`);
  });
  dbg(sendTiddler,5);
}
