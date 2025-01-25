// name of the package
// name of wiki containing the project to be packaged
// filter of tiddlers from srcWiki  to include in the package
$tpi.package.maker = function (name, srcWiki, filter ) {
	var $tw = $rw;
	var $pw = get$tw(wiki);
	
	var pkgTitle = `${project}-package-${name}`;
	var currentPkg = $
	var pkg = {
		title: pkgTiddler,
		tags: `$:/pocket-io/${project}/package ${project} package`,
		list: '',
		text: '{ "tiddlers": {} }',
		description: 'Pocket-io package',
		name: name,
		"plugin-type": 'pocket-io',
		type: 'application/json',
		dependents: '',
		version: '0.0.0'
		}
	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getCreationFields(), {
			title: pkgTiddler,
			text: '{ "tiddlers": {} }',
			description: 'Tiddlers for pocket-io system',
			name: `Pocket-io ${name} tiddlers`,
			"plugin-type": 'pocket-io',
			type: 'application/json',
			dependents: '',
			version: '0.0.0'
			},
		$tw.wiki.getModificationFields(),
	))

	titles = [];
	srcTiddlers = $sw.utils.parseJSONSafe($sw.wiki.getTiddlersAsJson(filter),[]);
	srcTiddlers.forEach(tiddler => {
		$tw.wiki.addTiddler(new $tw.Tiddler(tiddler));
		titles.push(tiddler.title);
	})
	$tw.utils.repackPlugin(pkgTiddler, titles);
	titles.forEach(title => { $tw.wiki.deleteTiddler(title); })
}
