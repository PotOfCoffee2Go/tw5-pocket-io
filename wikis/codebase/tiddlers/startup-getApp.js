function getApp(filter) {
	// Remove '[[' and ']]'
	var title = $cw.utils.parseStringArray(filter);
	if (title.length !== 1) {
		return `Invalid filter ${title}`;
	}
	title = title[0];
	getCode(`[tag[$:/pocket-io/tabs/${title}]]`);
}
