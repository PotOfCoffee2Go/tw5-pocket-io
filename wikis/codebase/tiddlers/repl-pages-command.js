// cmd.man('repl-tut')
cmd.man = function(projectTitle, pageMode = true) {
	var tutorialTag = 'Projects';

	var pages = [], pageIdx = 0, pageMode = pageMode;
	var view = 'script'; // or 'writeup'

	var start = 'Toggle page mode, view Script or Writeup, Next, Prev, Quit t/s/w/(n)/p/q : ';
	var brief = 't/s/w/(n)/p/q : ';
	var end = 'End t/s/w/n/p/(q) : ';
	var prompt = start;

	var history = cpy($rt.history);

	function quit() {
		$rt.history = history;
		$rt.displayPrompt();
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

	function query() {
		if (view === 'writeup') {
			return `[list[$:/pocket-io/code/${projectTitle}/docs]removesuffix[ docs]addsuffix[ writeup]]`;
		}
		return `[tag[$:/pocket-io/code/${projectTitle}]]`;
	}
	function getPages() {
		pages = JSON.parse($cw.wiki.getTiddlersAsJson(query()));
	}

	function ask() {
		if (pageMode) {	console.clear(); }
		$rt.write(`cmd.show.code('${pages[pageIdx].title}')\n`);
		$rt.question(prompt, (answer) => {
			if (!answer && prompt === end) {
				quit();
				return;
			}
			prompt = brief;
			if (!answer || answer[0].toLowerCase() === 'n') {
				incPageIdx();
				ask();
			}
			else if (answer[0].toLowerCase() === 's') {
				view = 'script';
				getPages();
				ask();
			}
			else if (answer[0].toLowerCase() === 'w') {
				view = 'writeup';
				getPages();
				ask();
			}
			else if (answer[0].toLowerCase() === 't') {
				pageMode = !pageMode;
				ask();
			}
			else if (answer[0].toLowerCase() === 'p') {
				decPageIdx();
				ask();
			}
			else if (answer[0].toLowerCase() === 'q') {
				quit();
			}
			else {
				prompt = `Invalid '${answer}' - ` + start;
				ask();
			}
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
