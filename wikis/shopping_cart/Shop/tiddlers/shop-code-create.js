// Create a item
$tpi.topic.shopItemCreate = function (socket, msg) {
	var sender = cpy(msg.senderTiddler);
	var errorMsg = '';
	sender.ioResult = '';

	var itemTemplate = '[[shop-template-item-create]]';
	var templateJson = get$tw(msg.req.wikiName).wiki.getTiddlersAsJson(itemTemplate);
	var dataTiddler = JSON.parse(templateJson)[0];

	if (!dataTiddler) {
		sender.ioResult = `Error: Tiddler [[shop-template-item-create]] with item data does not exit`;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var itemWikiName = $shop.wikis.item;
	var dataWikiName = $shop.wikis.database;
	var itemName = dataTiddler.name;
	var active = dataTiddler.active === 'true' ? true : false;
	var price = dataTiddler.price;
	var qty = dataTiddler.qty;
	var itemId = uid();

	if (!itemWikiName) {
		errorMsg = `Error: Wiki to store the shop item info is required`;
	}
	else if (!dataWikiName) {
		errorMsg = `Error: Database Wiki to store the shop item records is required`;
	}
	else if (!itemName) {
		errorMsg = `Error: A item name is required`;
	}
	// Return error
	if (errorMsg) {
		sender.ioResult = errorMsg;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	var $tw = get$tw(itemWikiName); // destination wiki
	// TW procedures for the shopping cart system
	if (msg.req.wikiName !== itemWikiName) {
		var shopProcedures = '[[shop-template-procedures]]';
		var shopProceduresJson = get$tw(msg.req.wikiName).wiki.getTiddlersAsJson(shopProcedures);
		var proceduresTiddler = JSON.parse(shopProceduresJson)[0];

		// Add the shopping cart procedures tiddler to the destination wiki
		$tw.wiki.addTiddler(new $tw.Tiddler(proceduresTiddler));
	}

	// Get the item data and create shop item record (tiddler)
	var tiddler = dataTiddler;
	tiddler.title = `shop-item-${itemId}`;
	tiddler.caption = itemName;
	tiddler.tags = '$:/pocket-io/shop/item shop item';
	tiddler.itemId = itemId;
	// Add the user tiddler to the destination wiki
	$tw.wiki.addTiddler(new $tw.Tiddler(
		tiddler,
		$tw.wiki.getCreationFields(),
		$tw.wiki.getModificationFields()
	))

	var itemRecord = '[[shop-template-item-record]]';
	var recordJson = get$tw(msg.req.wikiName).wiki.getTiddlersAsJson(itemRecord);
	var recordTiddler = JSON.parse(recordJson)[0];

	// Return successful
	if (msg.req.wikiName === itemWikiName) {
		sender.ioResult = `Created item '${itemName}' - [[${tiddler.title}]]`;
	} else {
		sender.ioResult = `Created item '${itemName}' in wiki '${itemWikiName}' - ` +
			get$proxy(itemWikiName).link + `/#${tiddler.title}`;
	}

	msg.resultTiddlers.push(sender);

	// Tell all clients connected to destination wiki to refresh
	$refreshClients(itemWikiName);
	return msg;
}

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

	var userWikiName = $shop.wikis.user;
	var dataWikiName = $shop.wikis.database;
	var userName = dataTiddler.name;
	var taxrate = dataTiddler.taxrate;
	var active = dataTiddler.active === 'true' ? true : false;
	var userId = uid();
	var $tw = get$tw(userWikiName); // destination wiki

	if (!userWikiName) {
		errorMsg = `Error: Wiki to store the shop user info is required`;
	}
	else if (!dataWikiName) {
		errorMsg = `Error: Database Wiki to store the shop user records is required`;
	}
	else if (!userName) {
		errorMsg = `Error: A user name is required`;
	}
	else if (!$tw) {
		errorMsg = `Error: Wiki '${userWikiName}' is not in the Pocket-io network.`;
	}
	// Return error
	if (errorMsg) {
		sender.ioResult = errorMsg;
		msg.resultTiddlers.push(sender);
		return msg;
	}

	// TW procedures for the shopping cart system
	if (msg.req.wikiName !== userWikiName) {
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

	var userRecord = '[[shop-template-user-record]]';
	var recordJson = get$tw(msg.req.wikiName).wiki.getTiddlersAsJson(userRecord);
	var recordTiddler = JSON.parse(recordJson)[0];

	tiddler = recordTiddler;
	var contentJson = JSON.parse(tiddler.text);
	contentJson.userId = userId;
	contentJson.active = active;
	contentJson.name = userName;
	contentJson.taxrate = taxrate;
	tiddler.text = JSON.stringify(contentJson, null, 2);

	tiddler.title = `shop-user-record-${userId}`;
	tiddler.caption = userName;
	tiddler.tags = '$:/pocket-io/shop/record/user user record';
	tiddler.userId = userId;
	// Add the user record tiddler to the database wiki
	$tw = get$tw(dataWikiName);
	$tw.wiki.addTiddler(new $tw.Tiddler(
		tiddler,
		$tw.wiki.getCreationFields(),
		$tw.wiki.getModificationFields()
	))

	// Return successful
	if (msg.req.wikiName === userWikiName) {
		sender.ioResult = `Created user '${userName}' - [[${tiddler.title}]]`;
	} else {
		sender.ioResult = `Created user '${userName}' in wiki '${userWikiName}' - ` +
			get$proxy(userWikiName).link + `/#${tiddler.title}`;
	}

	msg.resultTiddlers.push(sender);

	// Tell all clients connected to destination wiki to refresh
	$refreshClients(userWikiName);
	$refreshClients(dataWikiName);
	return msg;
}
