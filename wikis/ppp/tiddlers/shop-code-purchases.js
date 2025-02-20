// Apply any taxes, handling, shipping fees to purchased items
$shop.task.applyFeesToPurchases = function (transaction) {
	const state =  'purchase';
	const { taxRate, purchases} = transaction.user;
	const updatedPurchases = purchases.map(item => purchaseItem(transaction, item));
	const user = Object.assign({}, transaction.user, { purchases: updatedPurchases, state });
	$shop.fn.cacheTransHistory(transaction, state);
	return Object.assign({}, transaction, { user });
}

// Create the order from the purchases
$shop.task.orderPurchases = function (transaction) {
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
	$shop.fn.cacheTransHistory(transaction, state);
	return Object.assign({}, transaction, { user });
}
