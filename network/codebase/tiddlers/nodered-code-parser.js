// -------------------------
// Parser is used a lot - so placing here
// (load before $NodeServer)
function $nrParser(payload) {
	var tiddlers = [];

	function deserializeTid(lines) {
		var text = lines.join('\n').replace(/^\s*/,'');
		if (text) {
			tiddlers.push($rw.wiki.deserializeTiddlers(
				null, text,
				{ title: 'Parsing error' },
				{ deserializer: 'application/x-tiddler' })[0]
			);
		}
	}

	function compoundTid(text) {
		const lines = text.split('\n');
		var tidText = [];
		lines.forEach(line => {
			if (/^\s*\+===\+\s*$/.test(line)) {
				deserializeTid(tidText);
				tidText = [];
				return; // continue next line
			}
			tidText.push(line);
		})
		deserializeTid(tidText);
		return tiddlers;
	}

	// Single tiddler - push to the resultTiddlers
	//  else concat the array of tiddlers to resultTiddlers
	if (typeof payload === 'string') {
		// JSON in string format?
		if (/^\s*\{/.test(payload) || /^\s*\[/.test(payload) ) {
			tiddlers = $rw.wiki.deserializeTiddlers(
				null, payload,
				{ title: 'Parsing error' },
				{ deserializer: 'application/json' }
			);
		}
		else { // Assume in .tid format
			tiddlers = compoundTid(payload);
		}
		return tiddlers;
	}
	if (!Array.isArray(payload)) { return [payload]; }
	return payload;
}
