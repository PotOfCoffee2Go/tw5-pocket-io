// Create a item
$tpi.topic.shopItemCreate = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var errorMsg = '';
	sender.ioResult = '';

	var itemTemplate = '[[shop-template-item-create]]';
	var templateJson = get$tw(msg.req.wikiName).wiki.getTiddlersAsJson(userTemplate);
	var dataTiddler = JSON.parse(templateJson)[0];

	if (!dataTiddler) {
		sender.ioResult = `Error: Tiddler [[shop-template-item-create]] with item data does not exit`;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var dstWikiName = dataTiddler.shopUserWiki;
	var itemName = dataTiddler.shopItemName;
	var itemId = uid();
	var $tw = get$tw(dstWikiName); // destination wiki

	if (!dstWikiName) {
		errorMsg = `Error: Wiki to store the shop item info is required`;		
	}
	else if (!itemName) {
		errorMsg = `Error: A item name is required`;
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
	tiddler.title = `shop-item-${userId}`;
	tiddler.caption = itemName;
	tiddler.tags = '$:/pocket-io/shop/item shop item';
	tiddler.itemId = itemId;
	// Add the user tiddler to the destination wiki
	$tw.wiki.addTiddler(new $tw.Tiddler(
		tiddler,
		$tw.wiki.getCreationFields(),
		$tw.wiki.getModificationFields()
	))

	// Return successful
	if (msg.req.wikiName === dstWikiName) {
		sender.ioResult = `Created item '${itemName}' - [[${tiddler.title}]]`;
	} else {
		sender.ioResult = `Created item '${itemName}' in wiki '${dstWikiName}' - ` +
			get$proxy(dstWikiName).link + `/#${tiddler.title}`;
	}

	msg.resultTiddlers.push(sender);

	// Tell all clients connected to destination wiki to refresh
	$tpi.fn.io.refreshClients(dstWikiName);
	return msg;
}
