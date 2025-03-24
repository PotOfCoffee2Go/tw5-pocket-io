const get$twCodebase = $ss.find(settings => settings.name === 'codebase').$tw;

// $ss is shorthand for 'serverSettings'
const get$wikiNames = $ss
	.filter(settings => settings.excludeLinks === false)
	.map(settings => settings.name);

const get$settings = (name) => $ss.find(settings => settings.name === name) ?? {};

// Database Wikis
const get$db = (name) => $db[name].$tw;
const qry$db = (name, filter) => JSON.parse(get$db(name).wiki.getTiddlersAsJson(filter));
const ins$db = (name, tiddler) => {
	const $tw = get$db(name);
	$tw.wiki.addTiddler($tw.Tiddler(
		$tw.wiki.getCreationFields(),
		tiddler,
		$tw.wiki.getModificationFields()
	))
}


// User wikis
const get$tw = (name) => get$settings(name).$tw;
const qry$tw = (name, filter) => JSON.parse(get$tw(name).wiki.getTiddlersAsJson(filter));
const ins$tw = (name, tiddler) => {
	const $tw = get$db(name);
	$tw.wiki.addTiddler($tw.Tiddler(
		$tw.wiki.getCreationFields(),
		tiddler,
		$tw.wiki.getModificationFields()
	))
}

// Proxy server
const get$proxy = (name) => get$settings(name).proxy ?? {};
const get$server = (name) => get$proxy(name).server ?? {};
const get$router = (name) => get$server(name).router ?? {};
const get$pocketio = (name) => get$server(name).pocketio ?? {};
