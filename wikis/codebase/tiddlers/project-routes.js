app.get('/project/:command/:project/:fnName?', (req, res) => {
  var { command, project, fnName } = req.params;
  var result;
  switch (command) {
    case 'create':
      result = projectCreate(project);
      break;
    case 'update':
      result = projectUpdate(project, fnName);
      break;
    case 'delete':
      result = projectDelete(project, fnName);
      break;
   default:
      result = "Invalid command";
  }
  req.params.result = result;
  var jsonResult = JSON.stringify(req.params);
  res.set('content-type', 'text/plain');
  res.end(jsonResult);
});

app.all('/*', (req, res) => {
	twProxy.web(req, res, {target: 'http://127.0.0.1:8082'});
});

