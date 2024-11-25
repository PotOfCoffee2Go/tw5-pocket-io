// Place ioResult text into the ioResult template
var formatIoResult = (txt = '') => {
	var template = $cw.wiki.getTiddlerText('$:/pocket-io/ioResult-template');
	if (!template) { return txt; }
	return template.replace('$$$text$$$', txt);
}
