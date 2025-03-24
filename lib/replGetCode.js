const log = (...args) => {console.log(...args);}
const hue = (txt, nbr=214) => `\x1b[38;5;${nbr}m${txt}\x1b[0m`;
const hog = (txt, nbr) => log(hue(txt, nbr));

// Get code from $codebase wiki into the REPL
// A modified  copy is in codebase wiki 'startup' project [[startup-getCode]]
const UglifyJS = require('uglify-js'); // Code minify
const { hideStdout } = require('./hideStdout');

function getCodeFromWiki($rt, wikiName, $tw, filter) {
	var byteCount = 0, hasErrors = false;
	hog(`Autoload - ${wikiName + ': ' + filter.replace(/\]\]/g, ']]')}`, 129);

	// Do not display the minified code being loaded to REPL
	var showStdout = hideStdout();
	$rt.write('.editor\n');
	var tiddlers = JSON.parse($tw.wiki.getTiddlersAsJson(filter));
	tiddlers.forEach(tiddler => {
		if (tiddler.type !== 'application/javascript') {
			showStdout()
			hog(`'${tiddler.title}' bypassed - is not type application/javascript`, 163);
			hideStdout();
			return; // continue to next forEach
		}
		var minified = UglifyJS.minify(tiddler.text);
		if (minified.error) {
			showStdout();
			hog(`Error processing tiddler: '${tiddler.title}'\n${minified.error}`,9);
			hideStdout();
			hasErrors = true;
			return; // continue to next forEach
		}
		$rt.write(minified.code + '\n');
		showStdout();
		hog(`'${tiddler.title}' ${minified.code.length} bytes`, 93);
		byteCount += minified.code.length;
		hideStdout();
	})
	$rt.write(null,{ctrl:true, name:'d'})
	showStdout();

	hog(`${tiddlers.length} code tiddlers loaded - ${(byteCount/1024).toFixed(3)}K bytes.`, 129);
	return { tiddlerCount: tiddlers.length, byteCount, hasErrors };
}

exports.replGetCodeFromWikis = function replGetCodeFromWikis($rt, serverSettings) {
	var codeList = [];
	// codebase 'startup project' loads first
	codeList.push({wikiName: 'codebase',
		$tw: serverSettings.find(settings => settings.name === 'codebase').$tw,
		filter: '[tag[$:/pocket-io/startup/code]]'})

	var	findProjects = '[tag[Projects]]';
	serverSettings.forEach(settings => {
		var $tw = settings.$tw;
		$tw.wiki.filterTiddlers(findProjects).forEach(projectTitle => {
			if (projectTitle !== 'startup') {
				var projectTid = $tw.wiki.getTiddler(projectTitle);
				if (projectTid && projectTid.fields && projectTid.fields.autoLoad === 'yes') {
					codeList.push({wikiName: settings.name, $tw: $tw, filter: `[tag[$:/pocket-io/${projectTitle}/code]]`});
				}
			}
		})
	})

	var totalTiddlers = 0, totalBytes = 0, haveErrors = false;
	codeList.forEach(codeFilter => {
		var { tiddlerCount, byteCount, hasErrors } = getCodeFromWiki($rt, codeFilter.wikiName, codeFilter.$tw, codeFilter.filter);
		totalTiddlers += tiddlerCount;
		totalBytes += byteCount;
		haveErrors = haveErrors ? true : hasErrors;
	})

	return ({ totalTiddlers, totalBytes, haveErrors });
}
