function syncGet(title) {
  const options = { 
    method: 'GET',
    host: listenServer.variables.host,
    port: listenServer.variables.port,
    path: encodeURI(`/recipes/default/tiddlers/${title}`)
  };
  const request = http.request(options, (res) => {
    if (res.statusCode !== 200) {
      log(hue(`Failed to get '${title}'. Code: ${res.statusCode}`,9));
      res.resume();
      return;
    }
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('close', () => {
      log('');wrt(`get tiddler '${title}'`);
      wrt(JSON.parse(data));rt.displayPrompt();
    });
  });
  request.end();
  request.on('error', (err) => {
    console.error(`Encountered an error trying to make a request: ${err.message}`);
  });
}
