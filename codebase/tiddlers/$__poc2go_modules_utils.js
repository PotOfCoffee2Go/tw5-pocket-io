/*\
title: $:/poc2go/modules/utils.js
type: application/javascript
module-type: library

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

if($tw.node) {
	var fs = require("fs"),
		path = require("path");
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

exports.removeCommentBlocks = removeCommentBlocks;

})();
