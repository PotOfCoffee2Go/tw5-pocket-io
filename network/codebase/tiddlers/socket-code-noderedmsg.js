(function $nodeRedMsg() {
	var q = $nrOutMsg;
	q.request = null;
	function repeatTask() {
		q.awaitQueue()
		.then(msg => {
			q.request = null;
			var wikiName = msg.req.wikiName;
			for (client in $sockets) {
				if ($sockets[client].wikiName === wikiName) {
					$sockets[client].socket.emit('msg', msg);
				}
			}
			repeatTask();
		})
	}
	repeatTask();
})();
