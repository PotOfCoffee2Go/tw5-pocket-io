// Returns a Promise to fetch tiddler(s) in text format
$tpi.fn.fetchTextUrl = function (getUrl) {
	return new Promise((resolve) => {
		fetch(getUrl)
			.then(res => res.text())
			.then(data => { resolve(data) })
			.catch(err => {console.error(err);});
	})
}
