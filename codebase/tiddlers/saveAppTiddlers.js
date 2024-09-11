function saveRunAppJob() {
  commander.execute($tw.wiki,[
    '--output', '.',
    '--render',
    `[[runapp.js]]`,
    `[addprefix[${twOutput}/static/]]`,
    'text/plain',
    '$:/poc2go/rendered-plain-text',
  ])
}

function saveAppTiddlers() {
  commander.execute($tw.wiki,[
    '--output', '.',
    '--render',
    `[tag[app]]`,
    `[addprefix[${twOutput}/static/]addsuffix[.js]]`,
    'text/plain',
    '$:/poc2go/rendered-plain-text',
  ])
  // Remove up to and including the 'node -e ...' line
  // Use variables so doesn't match when loading this function
  var exp = new RegExp('^[\\S\\s]*rt.' + 'ignoreUndefined');
  var rpl = 'rt.' + 'ignoreUndefined';

  $tw.wiki.getTagMap('app').app.forEach(title => {
    var data = fs.readFileSync(`./${twOutput}/static/${title}.js`, 'utf8');
    data = data.replace(exp, rpl);
    fs.writeFileSync(`./${twOutput}/static/${title}.js`, extractCode(data));
    wrt(`node ./static/runapp "./${twOutput}/static/${title}.js" - app output complete`);
  })
}

function extractCode(data) {
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
	code.push(data.length-1)

	for (let idx=0; idx<code.length; idx+=2) {
		codeOutput += data.substring(code[idx],code[idx+1]);
	}

	return codeOutput.split('\n').filter(x => x !== '').join('\n');
}
