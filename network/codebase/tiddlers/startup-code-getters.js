// $ss is shorthand for 'serverSettings'
$rt.context.$twCodebase = $ss.find(settings => settings.name === 'codebase').$tw;

$rt.context.$wikiNames = $ss
	.filter(settings => settings.excludeLinks === false)
	.map(settings => settings.name);

$rt.context.get$settings = (name) => $ss.find(settings => settings.name === name) ?? {};

// Database Wikis
$rt.context.get$db = (name) => $db[name].$tw;
$rt.context.qry$db = (name, filter) => JSON.parse(get$db(name).wiki.getTiddlersAsJson(filter));
$rt.context.ins$db = (name, tiddler) => {
	const $tw = get$db(name);
	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getCreationFields(),
		tiddler,
		$tw.wiki.getModificationFields()
	))
}

// User wikis
$rt.context.get$tw = (name) => get$settings(name).$tw;
$rt.context.qry$tw = (name, filter) => JSON.parse(get$tw(name).wiki.getTiddlersAsJson(filter));
$rt.context.ins$tw = (name, tiddler) => {
	const $tw = get$tw(name);
	$tw.wiki.addTiddler(new $tw.Tiddler(
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

// Although the REPL ($rt) handles circular references - Node-Red has
//  some issues when accessing $rt (REPL runtime) directly due
//  to the REPL referencing itself.
// Currently - Node-Red only uses $rt directly to display the REPL prompt
//  so placing $rt in a wrapper to display the console prompt 
$rt.context.$displayPrompt = () => $rt.displayPrompt();

