var $shop = {
	settings: {
		transToBeSaved: false
	},
	wikis: {
		trans: 'ShopDb',
		user: 'ShopDashboard',
		item: 'ShopDashboard',
		database: 'ShopDb',
		purchase: 'ppp',
		order: 'ppp' 
	},
	fn: {},
	task: {},
	cache: {
		userCache: [],
		transHistory: []
	}
}

// Create a shopping cart
$shop.Cart = function() {
	var self = this;

	// pipe - process task functions left to right
	const pipe = (f,g) => (...args) => g(f(...args));
	const pipeline = (...fns) => fns.reduce(pipe);

	// Tasks
	// Order item bypassing the shopping cart (one-click order)
	this.orderItem = pipeline(
		startTransaction,
		$shop.task.buySingleItem,
		$shop.task.applyFeesToPurchases,
		$shop.task.orderPurchases,
		$shop.task.saveUserRecord,
		endTransaction,
		$shop.task.saveTransactionHistory);

	// Place (or modify existing) item in shopping cart
	this.itemToCart = pipeline(
		startTransaction,
		$shop.task.addItemToCart,
		$shop.task.saveUserRecord,
		endTransaction,
		$shop.task.saveTransactionHistory);

	// Remove item from shopping cart
	this.itemFromCart = pipeline(
		startTransaction,
		$shop.task.removeItemFromCart,
		$shop.task.saveUserRecord,
		endTransaction,
		$shop.task.saveTransactionHistory);

	// Purchase all items in shopping cart
	this.orderCart = pipeline(
		startTransaction,
		$shop.task.buyCartItems,
		$shop.task.applyFeesToPurchases,
		$shop.task.emptyCart,
		$shop.orderPurchases,
		$shop.saveUserRecord,
		endTransaction,
		$shop.task.saveTransactionHistory);

	// Get current user record
	this.getUser = (userId) => {
		var user = $shop.cache.userCache.find((user) => user.userId === userId);
		if (!user) {
			const $tw = get$tw($shop.wikis.database);
			user = $tw.utils.parseJSONSafe(
				$tw.wiki.getTiddlerText(`shop-user-record-${userId}`)
			)
		}
		return Object.assign({},user ?? guestUser); 
	}

	// Get item
	this.getItem = (itemId) => {
		const $tw = get$tw($shop.wikis.item);
		var item = JSON.parse($tw.wiki.getTiddlersAsJson(`[[shop-item-${itemId}]]`))[0];
		delete item.text;
		return Object.assign({}, item); // to-do not found?
	}


	// All function pipelines start a transaction
	// The transaction is setup based on the parameters passed
	// Only userName - accesses the current user record
	//  with itemName includes the item of that name
	//  plus field and value - updates item[fieeeeeeeeeld] = value
	function startTransaction(userId, itemId, field, value) {
		// Passed a transaction object - just return it
		if (typeof userId === 'object') {
			return Object.assign({}, userId);
		}

		var transaction = {
			transId: uid(),
			user: self.getUser(userId),
			item: self.getItem(itemId)
		}
		$shop.fn.cacheTransHistory(transaction, 'startTransaction');
		if (field) {
			transaction = $shop.fn.modifyCartItem(transaction, itemId, field, value);
		}
		if (!transaction.item.name) {
			delete transaction.item;
		}
		return Object.assign({}, transaction);
	}

	// All function pipelines end with endTransaction
	// It is here that transaction results are stored
	// until queried to update the TW wiki database(s)
	function endTransaction(transaction) {
		$shop.cache.userCache.unshift(Object.assign({}, transaction.user));
		$shop.fn.cacheTransHistory(transaction, 'endTransaction');
		return Object.assign({}, transaction);
	}

	
	return self;
}
