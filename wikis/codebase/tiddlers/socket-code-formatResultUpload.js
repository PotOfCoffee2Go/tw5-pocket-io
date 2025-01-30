// Place ioResult text into the ioResult template
$tpi.fn.formatIoResultUpload = function (txt = '') {
	var template = get$tw('codebase').wiki.getTiddlerText('$:/poc2go/pocket-io/result/upload-template');
	if (!template) { return txt; }
	return template.replace('$$$text$$$', tStamp() + txt);
}
