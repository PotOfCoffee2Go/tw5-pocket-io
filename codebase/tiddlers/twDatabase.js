var $db;
// (Re)create/load the database (ie: wiki) from sync server directory
// See https://tiddlywiki.com/static/LoadCommand.html
function loadDB() {
  $db = new $tw.Wiki;
  commander.execute($db, ['--load', `${twOutput}/tiddlers`]);
  return '$db load complete';
}

// Save tiddler to sync server directory
// See https://tiddlywiki.com/static/SaveCommand.html
function saveDB(filter = '[!is[system]]') {
  log(hue('TBD',9));
  return `$db save ${filter} complete`;
}
