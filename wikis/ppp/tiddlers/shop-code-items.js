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
/*
	tiddler = recordTiddler;
	var contentJson = JSON.parse(tiddler.text);
	contentJson.itemId = itemId;
	contentJson.active = active;
	contentJson.name = itemName;
	contentJson.price = parseFloat(Number.parseFloat(price).toFixed(2));
	contentJson.qty = parseInt(qty);
	tiddler.text = JSON.stringify(contentJson, null, 2);

	tiddler.title = `shop-item-record-${itemId}`;
	tiddler.caption = itemName;
	tiddler.tags = '$:/pocket-io/shop/record/item item record';
	tiddler.itemId = itemId;
	// Add the item record tiddler to the database wiki
	$tw = get$tw(dataWikiName);
	$tw.wiki.addTiddler(new $tw.Tiddler(
		tiddler,
		$tw.wiki.getCreationFields(),
		$tw.wiki.getModificationFields()
	))
*/

	// Return successful
	if (msg.req.wikiName === itemWikiName) {
		sender.ioResult = `Created item '${itemName}' - [[${tiddler.title}]]`;
	} else {
		sender.ioResult = `Created item '${itemName}' in wiki '${itemWikiName}' - ` +
			get$proxy(itemWikiName).link + `/#${tiddler.title}`;
	}

	msg.resultTiddlers.push(sender);

	// Tell all clients connected to destination wiki to refresh
	$tpi.fn.io.refreshClients(itemWikiName);
	return msg;
}

// Inserts or updates item in the shopping cart
$shop.task.addItemToCart = function (transaction) {
log('hhhit')
	const state =  'addItemToCart';
	transaction.item.source = transaction.item.source ? transaction.item.source : state;
	transaction.item.oneClickBuy = false;
dir(transaction,8);

	if (transaction.item.itemId) {
		const itemIdx = transaction.user.cart.findIndex((element) => element.itemId === transaction.item.itemId);
		if (itemIdx > -1) {
			transaction.user.cart.splice(itemIdx, 1);
		}
	}
	const updatedCart = transaction.user.cart.concat(transaction.item);
	const user = Object.assign({}, transaction.user, { cart: updatedCart, state });
	$shop.fn.cacheTransHistory(transaction, state);
	return Object.assign({}, transaction, { user });
}

	// Purchase an item bypassing the shopping cart
$shop.task.buySingleItem = function (transaction) {
	const state =  'buySingleItem';
	transaction.item.source = transaction.item.source ? transaction.item.source : state;
	transaction.item.oneClickBuy = true;
	const updatedPurchases = transaction.user.purchases.concat([transaction.item]);
	const user = Object.assign({}, transaction.user, { purchases: updatedPurchases, state });
	$shop.fn.cacheTransHistory(transaction, state);
	return Object.assign({}, transaction, { user });
}

	// Purchase all items in the shopping cart
$shop.task.buyCartItems = function (transaction) {
	const state =  'buyCartItems';
	const updatedPurchases = transaction.user.purchases.concat(transaction.user.cart);
	const user = Object.assign({}, transaction.user, { purchases: updatedPurchases, state });
	$shop.fn.cacheTransHistory(transaction, state);
	return Object.assign({}, transaction, { user });
}

// Remove item from the shopping cart
$shop.task.removeItemFromCart = function (transaction) {
	const state =  'removeItemFromCart';
	transaction.item.source = transaction.item.source ? transaction.item.source : state;
	if (transaction.item.itemId) {
		const itemIdx = transaction.user.cart.findIndex(
			(element) => element.itemId === transaction.item.itemId
		);
		if (itemIdx > -1) {
			transaction.user.cart.splice(itemIdx, 1);
		}
	}
	const user = Object.assign({}, transaction.user, { cart: transaction.user.cart });
	$shop.fn.cacheTransHistory(transaction, state);
	return Object.assign({}, transaction, { user });
}
