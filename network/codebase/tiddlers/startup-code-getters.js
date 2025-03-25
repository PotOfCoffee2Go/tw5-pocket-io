$rt.context.$twCodebase = $ss.find(settings => settings.name === 'codebase').$tw;

// $ss is shorthand for 'serverSettings'
$rt.context.$wikiNames = $ss
	.filter(settings => settings.excludeLinks === false)
	.map(settings => settings.name);

$rt.context.get$settings = (name) => $ss.find(settings => settings.name === name) ?? {};

// Database Wikis
$rt.context.get$db = (name) => $db[name].$tw;
$rt.context.qry$db = (name, filter) => JSON.parse(get$db(name).wiki.getTiddlersAsJson(filter));
$rt.context.ins$db = (name, tiddler) => {
	const $tw = get$db(name);
	$tw.wiki.addTiddler($tw.Tiddler(
		$tw.wiki.getCreationFields(),
		tiddler,
		$tw.wiki.getModificationFields()
	))
}


// User wikis
$rt.context.get$tw = (name) => get$settings(name).$tw;
$rt.context.qry$tw = (name, filter) => JSON.parse(get$tw(name).wiki.getTiddlersAsJson(filter));
$rt.context.ins$tw = (name, tiddler) => {
	const $tw = get$db(name);
	$tw.wiki.addTiddler($tw.Tiddler(
		$tw.wiki.getCreationFields(),
		tiddler,
		$tw.wiki.getModificationFields()
	))
}

// Proxy server
$rt.context.get$proxy = (name) => get$settings(name).proxy ?? {};
$rt.context.get$server = (name) => get$proxy(name).server ?? {};
$rt.context.get$router = (name) => get$server(name).router ?? {};
$rt.context.get$pocketio = (name) => get$server(name).pocketio ?? {};
