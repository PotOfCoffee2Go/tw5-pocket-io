$tpi.fn.tagData = function tagData(tw, filter, tags = []) {
	if (!Array.isArray(tags)) {
		tags = tw.utils.parseStringArray(tags);
	} 
	tw.wiki.filterTiddlers(filter).forEach(title => {
		var tiddler = tw.wiki.getTiddler(title);
		var tiddlerTags = tiddler.getFieldList('tags');
		tiddlerTags = tiddlerTags.concat(tags);
		tw.wiki.addTiddler(new tw.Tiddler(tiddler,
			{ tags: tw.utils.stringifyList(tiddlerTags) }
		));
	})
}
