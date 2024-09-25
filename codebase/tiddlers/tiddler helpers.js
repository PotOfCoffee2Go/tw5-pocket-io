// Tiddler Helpers for transport on the network
// Given a string - makes into a tiddler that is stringified
function stringifyTiddler(text, title = 'undefined') {
	return JSON.stringify({ title, text });
}
// Given a JSON string of tiddler(s) - makes JS object
function parseTiddlers(jsonTiddlers) {
	var tiddlers;
	try {
		tiddlers = JSON.parse(jsonTiddlers);
	} catch(e) {
		tiddlers = [];
	}
	if (!Array.isArray(tiddlers)) { tiddlers = [tiddlers] }
	return tiddlers;
}
