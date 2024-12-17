// cmd.man('repl-tut')
cmd.man = function(projectTitle, pageMode = true) {
	var tutorialTag = 'Tutorials';

	var pages = [];
	var pageIdx = 0;
	var pageMode = pageMode;

	var start = 'Toggle page mode, Next, Prev, Quit t/(n)/p/q : ';
	var brief = 't/(n)/p/q : ';
	var end = 'End t/n/p/(q) : ';
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

	function tutorials(projectTitle) {
		if (!projectTitle) {
			return $cw.wiki.getTiddlersWithTag(tutorialTag);
		}
		const tutorials = $cw.wiki.getTiddlersWithTag(tutorialTag);
		if (!tutorials.includes(projectTitle)) {
			hog(`'Project '${projectTitle}' doesn't exist or is not tagged as '${tutorialTag}'`, 9);
			return;
		}
		pages = JSON.parse($cw.wiki.getTiddlersAsJson(`[tag[$:/pocket-io/code/${projectTitle}]]`));
		if (pages.length === 0) {
			hog(`'Project '${projectTitle}' doesn't have any pages to display'`, 9);
			return;
		}
		ask();
	}

	function ask() {
		if (pageMode) {
			console.clear();
		}
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
				ask();
			}
		});
	}

	return tutorials(projectTitle);
}
