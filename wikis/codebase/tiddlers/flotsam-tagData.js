function tagData(filter, tags = []) {
	if (!Array.isArray(tags)) {
		tags = $dw.utils.parseStringArray(tags);
	} 
	$dw.wiki.filterTiddlers(filter).forEach(title => {
		var tiddler = $dw.wiki.getTiddler(title);
		var tiddlerTags = tiddler.getFieldList('tags');
		tiddlerTags = tiddlerTags.concat(tags);
		$dw.wiki.addTiddler(new $dw.Tiddler(tiddler,
			{ tags: $dw.utils.stringifyList(tiddlerTags) }
		));
	})
}
