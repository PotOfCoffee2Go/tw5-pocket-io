# Using a wiki as a database in Node.js
This post assumes knowledge of JavaScript.

## TiddlyWiki running in Node.js
I frequently use TiddlyWiki as a data entry database, copy info from the web into tiddlers, format and organize using tags and lists. By using server edition the tiddlers are stored server-side, thus can be accessed as a database by other server software - such as an [express](http://expressjs.com/) server.

Records in the database are tiddlers which are accessed using TiddlyWiki [filters](https://tiddlywiki.com/static/Filters.html) and managed using $tw wiki/utility functions.

### Setup the environment

 * Local install of the TiddlyWiki version to use for testing.
 * Verify successful install
 * Initialize a 'server' edition sync server
   * see https://tiddlywiki.com/static/InitCommand.html

```text
mkdir flotsam
cd flotsam
npm --prefix ./ install tiddlywiki@v5.3.5
node_modules/tiddlywiki/tiddlywiki.js --version
node_modules/tiddlywiki/tiddlywiki.js ./db-wiki --init server
```

> Above is for linux - depending on your OS may need to change `/` (slashes) to '\\' (backslashes) and tweak it a bit to work :(

### Functions
Define a set of functions to use a TiddlyWiki 'Wiki' as a database.
<details><summary>Global variables</summary>

```
const syncServerPath = './db-wiki';
var $tw, $db, syncProcess, syncController;
const { spawn } = require('node:child_process');
```

</details>
<details><summary>Boot up a TiddlyWiki instance</summary>

```
//------------------
// Create a tiddlywiki instance to manage the database
// Concise way to boot up a TiddlyWiki instance
var $tw;
function twBoot() {
  $tw = require('tiddlywiki').TiddlyWiki();
  $tw.boot.argv = ['db-wiki']; // TW output path
  $tw.boot.boot(() => {});
  return `TW v${$tw.version}`;
}
```

</details>
<details><summary>Startup the 'server' edition server used to add/update tiddlers</summary>

```
//------------------
// Start up the 'server' edition sync server at http://localhost:8080
// See https://tiddlywiki.com/static/ListenCommand.html
function twSyncServer(startText = 'started') {
  // Remove $:/StoryList tiddler(s) before restarting sync server
  fs.readdirSync(`${syncServerPath}/tiddlers/`)
    .filter(f => /\$__StoryList.*$/.test(f))
    .map(f => fs.unlinkSync(`${syncServerPath}/tiddlers/${f}`));

  // Allow us to bounce the sync server to acknowledge tiddler updates
  syncController = new AbortController();
  const { signal } = syncController;

  // Fire up the sync server
  syncProcess = spawn('node_modules/tiddlywiki/tiddlywiki.js',
    [syncServerPath, '--listen'], { signal, stdio: 'ignore' });

  // When we abort the server - restart it
  twSyncRestart();
  return `Sync server ${startText} - http://localhost:8080`;
}
```

</details>
<details><summary>Restarting the sync server when server-side tiddlers added/updated</summary>

```
// Bounce the sync server
function twSyncRestart() {
  syncProcess.on('error', (err) => {
    if (err.code === 'ABORT_ERR') {
      setTimeout(() => {
        console.dir(twSyncServer('restarted'));
        rt.displayPrompt();
      }, 1000);
    } else {
      console.dir(`Sync server error: ${err.code}`);
    }
  });
  syncProcess.on('close', (err) => { console.dir('Sync server stopped'); });
}
```

</details>
<details><summary>A TiddlyWiki Commander to execute TW commmands</summary>

```
//------------------
// A tw.Commander to do commands
// See https://tiddlywiki.com/static/Commands.html
const commander = {
  checkForErrors: (err) => { if (err) { $tw.utils.error("Error: " + err); } },
  execute: (wiki, cmds) => {
    new $tw.Commander(cmds, commander.checkForErrors, wiki,
      {output: process.stdout, error: process.stderr})
    .execute();
  }
}
```

</details>
<details><summary>Load to read the tiddlers created/updated by the browser</summary>

```
//------------------
// (Re)create/load the database (ie: wiki) from sync server directory
// See https://tiddlywiki.com/static/LoadCommand.html
var $db;
function loadDB() {
  $db = new $tw.Wiki;
  commander.execute($db, ['--load', `${syncServerPath}/tiddlers`]);
  return '$db load complete';
}
```

</details>
<details><summary>Save to update the tiddlers in the browser</summary>

```
// Save tiddler to sync server directory
// See https://tiddlywiki.com/static/SaveCommand.html
function saveDB(filter = '[!is[system]]') {
  commander.execute($db, ['--output', `${syncServerPath}/tiddlers`, '--save', filter]);
  syncController.abort();
  return `$db save ${filter} complete`;
}
```

</details>

### Run a node.js REPL for interactive testing
The node REPL is a handy way to try node.js stuff on-the-fly.

<details>
<summary> Method used to customize the REPL</summary>

Typing `node` and pressing return - brings up the default node.js REPL.
```text
poc2go:~/flotsam $ node
Welcome to Node.js v18.17.0.
Type ".help" for more information.
>
```

`node -e "require('node:repl').start()"` does the same (other than displaying the system info text).

```text
poc2go:~/flotsam $ node -e "require('node:repl').start()"
>
```

Will now embellish the JS code to allow access to the REPL runtime functions from the REPL command prompt.
```
node -e "rt=require('node:repl').start();rt.context.rt=rt;"
```

This has node start the REPL which returns the REPL runtime into variable 'rt'.

'rt' is then assigned to the REPL context (ie: can be accessed at the REPL command prompt as 'rt').

```text
poc2go:~/flotsam $ node -e "rt=require('node:repl').start();rt.context.rt=rt;"
> rt.setPrompt('yippie!! > ')
undefined
yippie!! >
```
Thus - the first two lines give access to the functions of the REPL that is running; and sets the REPL to not display the very irritating 'undefined' messages and change the prompt.

setPrompt() is one of many functions available to manage the REPL - see https://nodejs.org/api/repl.html .

```text
poc2go:~/flotsam $ node -e "rt=require('node:repl').start();rt.context.rt=rt;"
> rt.ignoreUndefined = true, rt.setPrompt('My tests > ');
My tests >
```
</details>

While still in the 'flotsam' directory, copy/paste the following:
```js
node -e "rt=require('node:repl').start();rt.context.rt=rt;"
rt.ignoreUndefined = true, rt.setPrompt('');
// rt is this REPL's runtime - see https://nodejs.org/api/repl.html

const syncServerPath = './db-wiki';
var $tw, $db, syncProcess, syncController;
const { spawn } = require('node:child_process');

//------------------
// Create a tiddlywiki instance to manage the database
// Concise way to boot up a TiddlyWiki instance
function twBoot() {
  $tw = require('tiddlywiki').TiddlyWiki();
  $tw.boot.argv = ['main']; // TW output path
  $tw.boot.boot(() => {});
  return `TW v${$tw.version}`;
}

//------------------
// Start up the 'server' edition sync server at http://localhost:8080
// See https://tiddlywiki.com/static/ListenCommand.html
function twSyncServer(startText = 'started') {
  // Remove $:/StoryList tiddler(s) before restarting sync server
  fs.readdirSync(`${syncServerPath}/tiddlers/`)
    .filter(f => /\$__StoryList.*$/.test(f))
    .map(f => fs.unlinkSync(`${syncServerPath}/tiddlers/${f}`));

  // Allow us to bounce the sync server to acknowledge tiddler updates
  syncController = new AbortController();
  const { signal } = syncController;

  // Fire up the sync server
  syncProcess = spawn('node_modules/tiddlywiki/tiddlywiki.js',
    [syncServerPath, '--listen'], { signal, stdio: 'ignore' });

  // When we abort the server - restart it
  twSyncRestart();
  return `Sync server ${startText} - http://localhost:8080`;
}

// Bounce the sync server
function twSyncRestart() {
  syncProcess.on('error', (err) => {
    if (err.code === 'ABORT_ERR') {
      setTimeout(() => {
        console.dir(twSyncServer('restarted'));
        rt.displayPrompt();
      }, 1000);
    } else {
      console.dir(`Sync server error: ${err.code}`);
    }
  });
  syncProcess.on('close', (err) => { console.dir('Sync server stopped'); });
}

//------------------
// A tw.Commander to do commands
// See https://tiddlywiki.com/static/Commands.html
const commander = {
  checkForErrors: (err) => { if (err) { $tw.utils.error("Error: " + err); } },
  execute: (wiki, cmds) => {
    new $tw.Commander(cmds, commander.checkForErrors, wiki,
      {output: process.stdout, error: process.stderr})
    .execute();
  }
}

//------------------
// (Re)create/load the database (ie: wiki) from sync server directory
// See https://tiddlywiki.com/static/LoadCommand.html
function loadDB() {
  $db = new $tw.Wiki;
  commander.execute($db, ['--load', `${syncServerPath}/tiddlers`]);
  return '$db load complete';
}

// Save tiddler to sync server directory
// See https://tiddlywiki.com/static/SaveCommand.html
function saveDB(filter = '[!is[system]]') {
  commander.execute($db, ['--output', `${syncServerPath}/tiddlers`, '--save', filter]);
  syncController.abort();
  return `$db save ${filter} complete`;
}
```

Go to http://localhost:8080 and add some tiddlers

then come back to the REPL and ...


### Startup
```
//------------------------------------------------------
// Startup
rt.setPrompt('TW-DB > ');
twBoot();
twSyncServer();

loadDB()
$db.allTitles()
JSON.parse($db.getTiddlersAsJson('[!is[system]]'))
```

'loadDB()' to get any new/updated tiddlers from the sync server running in the browser.

There are tons of TiddlyWiki functions to manage the data in the database (wiki) :

  * `$db.` and press {tab} twice to see available tiddlywiki wiki functions
  * `$tw.utils.` and press {tab} twice for list of handy tiddlywiki utility functions

The JavaScript of the functions can be found by bringing up a TiddlyWiki in the browser and in 'Advanced search' `shadows` tab - paste the name of the function. Will get a list of all tiddlers that reference that function.

After a while will get an idea of where the functions are defined (can also try searching with `exports.` in front of the function name, which is common).

JS tiddlers starting with `$:/core/modules/utils/` will generally have the '$tw.utils.' function definitions.

For example: search for `getTiddlersAsJson` - tiddler `$:/core/modules/wiki.js` contains the [signature](https://developer.mozilla.org/en-US/docs/Glossary/Signature/Function) and definition.

