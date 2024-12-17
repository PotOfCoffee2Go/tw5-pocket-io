// Message from client
$tpi.fn.io.msg = function msg(socket, msgStr) {
	var msg = $rw.utils.parseJSONSafe(msgStr,{ resultTiddlers: [] });
	if (!(msg.req && msg.req.topic)) {
		hog('Malformed message - no msg.req.topic field',9);
		dir(msg);
		return;
	}
	if (!(msg.req.topic && !!$tpi.topic[msg.req.topic])) {
		socket.emit('msg',JSON.stringify($tpi.topic['badMsg'](socket, msg, `Invalid topic: ${msg.req.topic}`)));
		return;
	}
	var $tw = $dw; // default wiki
	socket.emit('msg',JSON.stringify($tpi.topic[msg.req.topic](socket, msg, $tw)));
}
