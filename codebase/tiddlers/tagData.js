function tagData(filter, tags = []) {
  if (!Array.isArray(tags)) {
    tags = $dw.utils.parseStringArray(tags);
  } 
  $data.filterTiddlers(filter).forEach(title => {
    var tiddler = $data.getTiddler(title);
    var tiddlerTags = tiddler.getFieldList('tags');
    tiddlerTags = tiddlerTags.concat(tags);
    $data.addTiddler(new $dw.Tiddler(tiddler,{ tags: $dw.utils.stringifyList(tiddlerTags) }));
  })
}
