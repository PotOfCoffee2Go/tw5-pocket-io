// This tab must be first code tab in project 'shop'
const $shop = {};
$shop.Cart = function() {
	var self = this;
	this.userCache = [];
	this.transHistory = [];

	// pipe - process functions left to right
	const pipe = (f,g) => (...args) => g(f(...args));
	const pipeline = (...fns) => fns.reduce(pipe);

	// Tasks
	// Order item bypassing the shopping cart (one-click order)
	this.orderItem = pipeline(startTransaction, buySingleItem, applyFeesToPurchases, orderPurchases, endTransaction);
	// Place (or modify existing) item in shopping cart
	this.itemToCart = pipeline(startTransaction, addItemToCart, endTransaction);
	// Purchase all items in shopping cart
	this.orderCart = pipeline(startTransaction, buyCartItems, applyFeesToPurchases, emptyCart, orderPurchases, endTransaction);

	// Get current user record
	this.getUser = (name) => {
		var user = self.userCache.find((user) => user.name === name);
		return Object.assign({},user ?? guestUser); 
	}

	// Get item
	this.getItem = (name) => {
		var item = items.find((item) => item.name === name);
		return Object.assign({}, item); // to-do not found?
	}

	// -----------------
	const uuid = () => crypto.randomUUID().split('-').pop(); // requires nodejs v16+
	const cpy = (obj) => JSON.parse(JSON.stringify(obj));

	// Purchase an item
	function purchaseItem(transaction, item) {
		const { taxRate } = transaction.user;
		return {
			transId: item.transId || transaction.transId,
			itemId: item.itemId,
			purchaseId: item.purchaseId || uuid(),
			orderId: item.orderId,
			name: item.name,
			price: item.price,
			qty: item.qty,
			cost: item.price * item.qty,
			tax: +(item.price * taxRate * item.qty).toFixed(2),
			total: +(item.price * (1 + taxRate) * item.qty).toFixed(2),
			oneClickBuy: item.oneClickBuy,
			source: item.source,
		}
	}

	// Transaction history
	function storeTransHistory(transaction, nextTask) {
		nextTask = nextTask ?? 'snapshot';
		self.transHistory.push(Object.assign({}, transaction, { nextTask }));
		return Object.assign({}, transaction);
	}

	// All function pipelines start a transaction
	// The transaction is setup based on the parameters passed
	// Only userName - accesses the current user record
	//  with itemName includes the item of that name
	//  plus field and value - updates item[fieeeeeeeeeld] = value
	function startTransaction(userName, itemName, field, value) {
		// Passed a transaction object - just return it
		if (typeof userName === 'object') {
			return Object.assign({}, userName);
		}

		var transaction = {
			transId: uuid(),
			user: self.getUser(userName),
			item: self.getItem(itemName)
		}
		storeTransHistory(transaction, 'startTransaction');
		if (field) {
			transaction = modifyCartField(transaction, itemName, field, value);
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
		storeTransHistory(transaction, 'endTransaction');
		self.userCache.unshift(Object.assign({}, transaction.user));
		return Object.assign({}, transaction);
	}

	// Modify field of an item in the shopping cart
	function modifyCartField(transaction, itemName, field, value) {
		function getCartItem(transaction, itemName) {
			const { cart } = transaction.user;
			transaction.item = cart.find((element) => element.name === itemName);
			if (!transaction.item) {
				transaction.item = items.find((element) => element.name === itemName);
			}
			return transaction;
		}

		function updateCartItemField(transaction, field, value) {
			if (transaction.item) {
				transaction.item[field] = value;
				transaction.item.source = 'modifiedItemField';

			}
			return transaction;
		}

		var trns = getCartItem(transaction, itemName)
		trns = updateCartItemField(trns, field, value)
		storeTransHistory(transaction, 'modifyCartField');
		return Object.assign({}, trns);
	}

	// Inserts or updates item in the shopping cart
	function addItemToCart(transaction) {
		const state =  'addItemToCart';
		transaction.item.source = transaction.item.source ? transaction.item.source : state;
		transaction.item.oneClickBuy = false;
		if (transaction.item.itemId) {
			const itemIdx = transaction.user.cart.findIndex((element) => element.itemId === transaction.item.itemId);
			if (itemIdx > -1) {
			  transaction.user.cart.splice(itemIdx, 1);
			}
		}
		const updatedCart = transaction.user.cart.concat(transaction.item);
		const user = Object.assign({}, transaction.user, { cart: updatedCart, state });
		storeTransHistory(transaction, state);
		return Object.assign({}, transaction, { user });
	}

	// Purchase an item bypassing the shopping cart
	function buySingleItem(transaction) {
		const state =  'buySingleItem';
		transaction.item.source = transaction.item.source ? transaction.item.source : state;
		transaction.item.oneClickBuy = true;
		const updatedPurchases = transaction.user.purchases.concat([transaction.item]);
		const user = Object.assign({}, transaction.user, { purchases: updatedPurchases, state });
		storeTransHistory(transaction, state);
		return Object.assign({}, transaction, { user });
	}

	// Purchase all items in the shopping cart
	function buyCartItems(transaction) {
		const state =  'buyCartItems';
		const updatedPurchases = transaction.user.purchases.concat(transaction.user.cart);
		const user = Object.assign({}, transaction.user, { purchases: updatedPurchases, state });
		storeTransHistory(transaction, state);
		return Object.assign({}, transaction, { user });
	}

	// Apply any taxes, handling, shipping fees to purchased items
	function applyFeesToPurchases(transaction) {
		const state =  'purchase';
		const { taxRate, purchases} = transaction.user;
		const updatedPurchases = purchases.map(item => purchaseItem(transaction, item));
		const user = Object.assign({}, transaction.user, { purchases: updatedPurchases, state });
		storeTransHistory(transaction, state);
		return Object.assign({}, transaction, { user });
	}

	// Create the order from the purchases
	function orderPurchases(transaction) {
		const state =  'order';
		const orderId = uuid();
		const { purchases } = transaction.user;

		const orderingPurchases = [];
		const alreadyOrderedPurchases = [];
			cpy(purchases).forEach(purchase => {
			if (!purchase.orderId) {
				purchase.orderId = orderId;
				orderingPurchases.push(purchase);
			}
			else {
				alreadyOrderedPurchases.push(purchase)
			}
		})
		const order = [{
			transId: transaction.transId,
			orderId,
			purchaseIds: orderingPurchases.map(item => item.purchaseId),
			cost: orderingPurchases.reduce(function (sum, purchase) { return sum + purchase.cost; }, 0),
			tax: orderingPurchases.reduce(function (sum, purchase) { return sum + purchase.tax; }, 0),
			total: orderingPurchases.reduce(function (sum, purchase) { return sum + purchase.total; }, 0),
		}]
		const orders = transaction.user.orders ? transaction.user.orders.concat(order) : order;
		const user = Object.assign({}, transaction.user, {
			purchases: alreadyOrderedPurchases.concat(orderingPurchases),
			orders,
			state
		});
		storeTransHistory(transaction, state);
		return Object.assign({}, transaction, { user });
	}

	// Clear the shopping cart
	function emptyCart(transaction) {
		const user = Object.assign({}, transaction.user, {cart: []});
		storeTransHistory(transaction, 'emptyCart');
		return Object.assign({}, transaction, { user });
	}
}

// Create a shopping cart
$shop.cart = new $shop.Cart();
