// node ./runtiddler "./{edition directory name} "{code tiddler}"
// -------------------
// Node'js REPL

const fs = require('node:fs');
const repl = require('node:repl');

// REPL and TiddlyWiki
var rt;
var $tw;

var edition = process.argv[2];
var tiddler = process.argv[3];

const submit = (cmd, key) => {// key = {ctrl: true, name: 'l'}
  process.nextTick(() => {
    rt.write(cmd, key);
  });
}

function twBoot() {
  return new Promise((resolve) => {
    $tw = require('tiddlywiki').TiddlyWiki();
    // $tw.preloadTiddlers = require('./preloadTiddlers.json');
    $tw.boot.argv = ['flotsam']; // TW output path is the code wiki
    $tw.boot.boot(() => { resolve(`TW v${$tw.version}`); });
  })
}

function removeCommentBlocks(data) {
	var searchTerm, pos = -1;
	const beg = [], end = [], code = [];
	var codeOutput = '';

	function beginings() {
		var idx = data.indexOf(searchTerm, pos+1);
		if (idx === -1) { return; }
		beg.push(idx);
		pos = idx;
		beginings();
	}

	function endings() {
		var idx = data.indexOf(searchTerm, pos+1);
		if (idx === -1) { return; }
		end.push(idx+2);
		pos = idx;
		endings();
	}

	data = '\n' + data;
	searchTerm = '\n/*'; pos = -1; beginings();
	searchTerm = '*/\n'; pos = -1; endings();
	if (beg.length !== end.length) {
		throw new Error('Mismatching comments');
	}

	code.push(0);
	for (let idx=0; idx<beg.length; idx++) {
		code.push(beg[idx]); code.push(end[idx])
	}
	code.push(data.length)

	for (let idx=0; idx<code.length; idx+=2) {
		codeOutput += data.substring(code[idx],code[idx+1]);
	}

	return codeOutput.split('\n').filter(x => x !== '').join('\n')+'\n';
}

var writeOutputFn;
function hideOutput() { return ''; }

function tiddlerToRepl(title, show = false) {
  const prevPrompt = rt.getPrompt();
  rt.setPrompt('');
  // Use variables so doesn't match when loading this function
  var exp = new RegExp('^[\\S\\s]*rt.' + 'ignoreUndefined');
  var rpl = 'rt.' + 'ignoreUndefined';

  var type = 'text/plain';
  var parser = $tw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');
  var widgetNode = $tw.wiki.makeWidget(
      parser,
      {variables: $tw.utils.extend({},
        {currentTiddler: title,storyTiddler: title})}
  );
  var container = $tw.fakeDocument.createElement("div");
  widgetNode.render(container,null);
  var text = container.textContent;
  text = text.replace(exp, rpl);
  text = removeCommentBlocks(text);
  rt.output.write = show ? writeOutputFn : hideOutput;
  var lnCount = 0;
  text.split('\n').forEach(line => {
    if (line !== '') {
	 rt.write(`${line}\n`);
	 lnCount++;
	}
  })
  rt.output.write = writeOutputFn;
  rt.setPrompt(prevPrompt);
  return `${lnCount} code lines evaluated`;
}

// REPL runtime
function startRepl() {
  rt = repl.start({
    prompt: '> ',
    ignoreUndefined: true,
    useColors: true
  });
  writeOutputFn = rt.output.write;
  rt.on('reset', () => resetContext());
  resetContext();
}

function resetContext() {
  rt.context.rt = rt;
  rt.context.getCode = tiddlerToRepl;
  rt.context.$twcode = $tw;
}

twBoot()
  .then(() => {
	startRepl();
	submit(`getCode('Prerequisites')\n`);
	submit(`twOutput='${edition}'\n`);
	submit('await twBoot()\n');
	submit(`getCode('${tiddler}')\n`)
  })

