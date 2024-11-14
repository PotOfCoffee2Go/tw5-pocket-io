// Load tiddlers to $data database
function setData(tiddlers = []) {
	if (!Array.isArray(tiddlers)) {
		tiddlers = [tiddlers]
	}
	tiddlers.forEach(tiddler => {
		$dw.wiki.addTiddler(new $dw.Tiddler(
			$dw.wiki.getCreationFields(),
			tiddler,
			$dw.wiki.getModificationFields(),
		))
	})
	return `${tiddlers.length} tiddlers updated on $data wiki`;
}
