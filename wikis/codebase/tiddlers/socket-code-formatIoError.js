// Place ioError text into the ioError template
$tpi.fn.formatIoError = function (txt = '') {
	var template = get$tw('codebase').wiki.getTiddlerText('$:/pocket-io/ioError-template');
	if (!template) { return txt; }
	return template.replace('$$$text$$$', tStamp() + txt);
}
