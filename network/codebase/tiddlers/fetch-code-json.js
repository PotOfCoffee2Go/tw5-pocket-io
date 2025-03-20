// Returns a Promise to fetch tiddler(s) in JSON format
$tpi.fn.fetchJsonUrl = function (getUrl) {
	return new Promise((resolve) => {
		fetch(getUrl)
			.then(res => res.json())
			.then(data => { resolve(data) })
			.catch(err => {console.error(err);});
	})
}
