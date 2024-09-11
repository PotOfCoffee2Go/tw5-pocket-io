// node ./runapp "./{server edition directory}/output/{appname}.js"
// -------------------
// Node'js REPL

const fs = require('node:fs');
const repl = require('node:repl');

// Place rt in REPL context so can be referenced from within the REPL
var rt;

var filePath = process.argv[2];

const submit = (cmd, key) => {// key = {ctrl: true, name: 'l'}
  process.nextTick(() => {
    rt.write(cmd, key);
  });
}

function loadRtFile() {
  var data = fs.readFileSync(filePath, 'utf8');
  var lines = data.split('\n');
  lines.forEach(line => {
    submit(`${line}\n`);
  })
}

// REPL runtime
function startRepl() {
  rt = repl.start({
    prompt: '> ',
    ignoreUndefined: true,
    useColors: true
  });

  rt.on('reset', () => resetContext());
  resetContext();
}

function resetContext() {
  rt.context.rt = rt;
}

startRepl();
loadRtFile();
