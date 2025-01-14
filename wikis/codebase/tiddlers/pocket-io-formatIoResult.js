// Place ioResult text into the ioResult template
$tpi.fn.formatIoResult = function formatIoResult(txt = '') {
	var template = get$tw('codebase').wiki.getTiddlerText('$:/pocket-io/ioResult-template');
	if (!template) { return txt; }
	return template.replace('$$$text$$$', tStamp() + txt);
}
