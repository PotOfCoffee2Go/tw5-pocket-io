// Place ioResult text into the ioResult template
$tpi.fn.formatIoResult = function (txt = '') {
	var template = get$tw('codebase').wiki.getTiddlerText('$:/poc2go/pocket-io/result/template');
	if (!template) { return txt; }
	return template.replace('$$$text$$$', tStamp() + txt);
}
