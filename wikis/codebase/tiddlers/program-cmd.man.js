// cmd.man('repl-tut')
cmd.man = function(projectTitle, pageMode = true) {
	var $cw = get$tw('codebase');
	var tutorialTag = 'Projects';

	var pages = [], pageIdx = 0, pageMode = pageMode;
	var view = 'script'; // or 'writeup'

	var start = 'Toggle page mode, view Script or Writeup, Next, Prev, Quit t/s/w/(n)/p/q : ';
	var brief = 't/s/w/(n)/p/q : ';
	var end = 'End t/s/w/n/p/(q) : ';
	var prompt = start;

	var history = cpy($rt.history);

	var queryWriteup = () => `[list[$:/pocket-io/code/${projectTitle}/docs]removesuffix[ docs]addsuffix[ writeup]]`;
	var queryCode = () => `[tag[$:/pocket-io/code/${projectTitle}]]`;
	var query = () => view === 'writeup' ? queryWriteup() : queryCode();
	function getPages() {
		pages = JSON.parse($cw.wiki.getTiddlersAsJson(query()));
	}

	function incPageIdx() {
		if (++pageIdx >= pages.length-1) {
			pageIdx = pages.length-1;
			prompt = end;
		}
	}
	function decPageIdx() {
		if (--pageIdx <= 0) {
			pageIdx = 0;
			prompt = start;
		}
	}
	function quit() {
		$rt.history = history;
		$rt.displayPrompt();
	}

	function ask() {
		if (pageMode) {	console.clear(); }
		$rt.write(`cmd.show.code('${pages[pageIdx].title}')\n`);
		$tpi.stdin.getNextChar = true;
		$rt.question(prompt, (answer) => {
			var ans = (answer[0] ?? 'n').toLowerCase();
			if ( (!answer && prompt === end) || ans === 'q') {
				quit();
				return;
			}
			prompt = brief;
			if (ans === 'n') { incPageIdx(); }
			else if (ans === 'p') { decPageIdx(); }
			else if (ans === 't') { pageMode = !pageMode; }
			else if (ans === 's') { view = 'script'; getPages(); }
			else if (ans === 'w') { view = 'writeup'; getPages(); }
			else { prompt = `Invalid '${answer}' - ` + start; }
			ask();
		});
	}

	function tutorials(projectTitle) {
		if (!projectTitle) {
			return $cw.wiki.getTiddlersWithTag(tutorialTag);
		}
		getPages();
		if (pages.length === 0) {
			hog(`'Project '${projectTitle}' doesn't have any pages to display'`, 9);
			return;
		}
		ask();
	}

	return tutorials(projectTitle);
}
