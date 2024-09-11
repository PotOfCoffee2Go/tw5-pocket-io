const tagged = (tag, wiki=$data) => wiki.getTiddlersWithTag(tag);

const fieldsToWiki = (fields) => {
	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getCreationFields(),
		fields,
		$tw.wiki.getModificationFields(),
	))
}


