// Create a user
$tpi.topic.shopUserCreate = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var errorMsg = '';
	sender.ioResult = '';

	var userTemplate = '[[shop-template-user-create]]';
	var templateJson = get$tw(msg.req.wikiName).wiki.getTiddlersAsJson(userTemplate);
	var dataTiddler = JSON.parse(templateJson)[0];

	if (!dataTiddler) {
		sender.ioResult = `Error: Tiddler [[shop-template-user-create]] with user data does not exit`;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var dstWikiName = dataTiddler.shopUserWiki;
	var userName = dataTiddler.shopUserName;
	var userId = uid();
	var $tw = get$tw(dstWikiName); // destination wiki

	if (!dstWikiName) {
		errorMsg = `Error: Wiki to store the shop user info is required`;		
	}
	else if (!userName) {
		errorMsg = `Error: A user name is required`;
	}
	else if (!$tw) {
		errorMsg = `Error: Wiki '${dstWikiName}' is not in the Pocket-io network.`;
	}
	// Return error
	if (errorMsg) {
		sender.ioResult = errorMsg;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	// TW procedures for the shopping cart system
	if (msg.req.wikiName !== dstWikiName) {
		var shopProcedures = '[[shop-template-procedures]]';
		var shopProceduresJson = get$tw(msg.req.wikiName).wiki.getTiddlersAsJson(shopProcedures);
		var proceduresTiddler = JSON.parse(shopProceduresJson)[0];

		// Add the shopping cart procedures tiddler to the destination wiki
		$tw.wiki.addTiddler(new $tw.Tiddler(proceduresTiddler));
	}

	// Get the user data and create shop user record (tiddler)
	var tiddler = dataTiddler;
	tiddler.title = `shop-user-${userId}`;
	tiddler.caption = userName;
	tiddler.tags = '$:/pocket-io/shop/user shop user';
	tiddler.userId = userId;
	// Add the user tiddler to the destination wiki
	$tw.wiki.addTiddler(new $tw.Tiddler(
		tiddler,
		$tw.wiki.getCreationFields(),
		$tw.wiki.getModificationFields()
	))

	// Return successful
	if (msg.req.wikiName === dstWikiName) {
		sender.ioResult = `Created user '${userName}' - [[${tiddler.title}]]`;
	} else {
		sender.ioResult = `Created user '${userName}' in wiki '${dstWikiName}' - ` +
			get$proxy(dstWikiName).link + `/#${tiddler.title}`;
	}

	msg.resultTiddlers.push(sender);

	// Tell all clients connected to destination wiki to refresh
	$tpi.fn.io.refreshClients(dstWikiName);
	return msg;
}
