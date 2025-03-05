// 'cmd' is a REPL global

const cmd = {
	list: { repl: () => $rw.wiki.getTiddlers() },
	text: { repl: (title) => hog($rw.wiki.getTiddlerText(title),39) },
	get: { repl: (title) => cpy($rw.wiki.getTiddler(title).fields) },
	set: { repl: (title, txt) => $rw.wiki.setText(title,'text', null, txt) },
	add: { repl: (tiddler) => $rw.wiki.addTiddler(new $rw.Tiddler(tiddler)) },
}

get$wikiNames.forEach(name => {
	cmd.list[name] = () => get$tw(name).wiki.getTiddlers();
	cmd.text[name] = (title) => hog(get$tw(name).wiki.getTiddlerText(title),39);
	cmd.get[name] = (title) => cpy(get$tw(name).wiki.getTiddler(title).fields);
	cmd.set[name] = (title, txt) => get$tw(name).wiki.setText(title,'text', null, txt);
	cmd.add[name] = (tiddler) => get$tw(name).wiki.addTiddler(new get$tw(name).Tiddler(tiddler));
})
