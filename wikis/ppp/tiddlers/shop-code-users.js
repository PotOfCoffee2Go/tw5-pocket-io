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
	var taxRate = dataTiddler.taxrate;
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
	contentJson.taxRate = taxRate;
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
	$tpi.fn.io.refreshClients(userWikiName);
	$tpi.fn.io.refreshClients(dataWikiName);
	return msg;
}

$shop.task.saveUserRecord = function (transaction) {
	const $tw = get$tw($shop.wikis.database);
	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getCreationFields(),
		$tw.wiki.getModificationFields(),
		{
			title: `shop-user-record-${transaction.user.userId}`,
			tags: '$:/pocket-io/shop/record/user user record',
			type: 'application/json',
			text: JSON.stringify(transaction.user, null, 2)
		}
	))
	$shop.fn.cacheTransHistory(transaction, 'saveUserRecord');
	$tpi.fn.io.refreshClients($shop.wikis.database);
	return Object.assign({}, transaction);
}
