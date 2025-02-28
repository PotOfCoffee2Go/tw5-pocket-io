// Purchase an item
$shop.fn.purchaseItem = function (transaction, item) {
	const { taxrate } = transaction.user;
	return {
		transId: item.transId || transaction.transId,
		itemId: item.itemId,
		purchaseId: item.purchaseId || uid(),
		orderId: item.orderId,
		name: item.name,
		price: item.price,
		qty: item.qty,
		cost: item.price * item.qty,
		tax: +(item.price * taxrate * item.qty).toFixed(2),
		total: +(item.price * (1 + taxrate) * item.qty).toFixed(2),
		oneClickBuy: item.oneClickBuy,
		source: item.source,
	}
}

// Apply any taxes, handling, shipping fees to purchased items
$shop.task.applyFeesToPurchases = function (transaction) {
	const state =  'purchase';
	const { taxrate, purchases} = transaction.user;
	const updatedPurchases = purchases.map(
		item => $shop.fn.purchaseItem(transaction, item)
	);
	const user = Object.assign({}, transaction.user, { purchases: updatedPurchases, state });
	$shop.fn.cacheTransHistory(transaction, state);
	return Object.assign({}, transaction, { user });
}

// Create the order from the purchases
$shop.task.orderPurchases = function (transaction) {
	const state =  'order';
	const orderId = uid();
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
