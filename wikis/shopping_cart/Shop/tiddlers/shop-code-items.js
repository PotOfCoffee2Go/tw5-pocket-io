// Inserts or updates item in the shopping cart
$shop.task.addItemToCart = function (transaction) {
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
	$shop.fn.cacheTransHistory(transaction, state);
	return Object.assign({}, transaction, { user });
}

// Modify field of an item in the shopping cart
$shop.fn.modifyCartItem = function (transaction, itemId, field, value) {
	function getCartItem(transaction, itemId) {
		const { cart } = transaction.user;
		transaction.item = cart.find((element) => element.itemId === itemId);
		if (!transaction.item) {
			tog('Need to-do!');
		}
		return transaction;
	}

	function updateCartItemField(transaction, field, value) {
		if (transaction.item) {
			transaction.item[field] = value;
			transaction.item.source = 'modifiedCartItem';
		}
		return transaction;
	}

	var trns = getCartItem(transaction, itemId)
	trns = updateCartItemField(trns, field, value)
	$shop.fn.cacheTransHistory(transaction, 'modifyCartField');
	return Object.assign({}, trns);
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
