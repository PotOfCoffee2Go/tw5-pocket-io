// 'cmd' is a REPL global

const cmd = {
	show: {
		dash: (title) => hog($ds.wiki.getTiddlerText(title),39),
		code: (title) => hog($cw.wiki.getTiddlerText(title),40),
		data: (title) => hog($dw.wiki.getTiddlerText(title),39),
		repl: (title) => hog($rw.wiki.getTiddlerText(title),39),
	},
	text: {
		dash: (title, txt) => $ds.wiki.setText(title,'text', null, txt),
		code: (title, txt) => $cw.wiki.setText(title,'text', null, txt),
		data: (title, txt) => $dw.wiki.setText(title,'text', null, txt),
		repl: (title, txt) => $rw.wiki.setText(title,'text', null, txt),
	},
	list: {
		dash: () => $ds.wiki.getTiddlers(),
		code: () => $cw.wiki.getTiddlers(),
		data: () => $dw.wiki.getTiddlers(),
		repl: () => $rw.wiki.getTiddlers(),
	},
	get: {
		dash: (title) => cpy($ds.wiki.getTiddler(title).fields),
		code: (title) => cpy($cw.wiki.getTiddler(title).fields),
		data: (title) => cpy($dw.wiki.getTiddler(title).fields),
		repl: (title) => cpy($rw.wiki.getTiddler(title).fields),
	},
	add: {
		dash: (tiddler) => $ds.wiki.addTiddler(new $ds.Tiddler(tiddler)),
		code: (tiddler) => $cw.wiki.addTiddler(new $cw.Tiddler(tiddler)),
		data: (tiddler) => $dw.wiki.addTiddler(new $dw.Tiddler(tiddler)),
		repl: (tiddler) => $rw.wiki.addTiddler(new $rw.Tiddler(tiddler)),
	},
}
