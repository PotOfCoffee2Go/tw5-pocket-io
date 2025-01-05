// 'cmd' is a REPL global

const cmd = {
	show: {
		dash: (title) => hog(get$tw('dashbase').wiki.getTiddlerText(title),39),
		code: (title) => hog(get$tw('codebase').wiki.getTiddlerText(title),40),
		data: (title) => hog(get$tw('database').wiki.getTiddlerText(title),39),
		repl: (title) => hog($rw.wiki.getTiddlerText(title),39),
	},
	text: {
		dash: (title, txt) => get$tw('dashbase').wiki.setText(title,'text', null, txt),
		code: (title, txt) => get$tw('codebase').wiki.setText(title,'text', null, txt),
		data: (title, txt) => get$tw('database').wiki.setText(title,'text', null, txt),
		repl: (title, txt) => $rw.wiki.setText(title,'text', null, txt),
	},
	list: {
		dash: () => get$tw('dashbase').wiki.getTiddlers(),
		code: () => get$tw('codebase').wiki.getTiddlers(),
		data: () => get$tw('database').wiki.getTiddlers(),
		repl: () => $rw.wiki.getTiddlers(),
	},
	get: {
		dash: (title) => cpy(get$tw('dashbase').wiki.getTiddler(title).fields),
		code: (title) => cpy(get$tw('codebase').wiki.getTiddler(title).fields),
		data: (title) => cpy(get$tw('database').wiki.getTiddler(title).fields),
		repl: (title) => cpy($rw.wiki.getTiddler(title).fields),
	},
	add: {
		dash: (tiddler) => get$tw('dashbase').wiki.addTiddler(new get$tw('dashbase').Tiddler(tiddler)),
		code: (tiddler) => get$tw('codebase').wiki.addTiddler(new get$tw('codebase').Tiddler(tiddler)),
		data: (tiddler) => get$tw('database').wiki.addTiddler(new get$tw('database').Tiddler(tiddler)),
		repl: (tiddler) => $rw.wiki.addTiddler(new $rw.Tiddler(tiddler)),
	},
}
