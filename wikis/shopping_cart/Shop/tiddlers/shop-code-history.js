// Transaction history cache
$shop.fn.cacheTransHistory = function (transaction, nextTask) {
	nextTask = nextTask ?? 'snapshot';
	$shop.cache.transHistory.push(Object.assign({}, transaction, { nextTask }));
	return Object.assign({}, transaction);
}

$shop.task.saveTransactionHistory = function (transaction) {
	if (!$shop.settings.transToBeSaved) {
		return Object.assign({}, transaction);
	}
	var transRecords = $shop.cache.transHistory.filter(
		record => record.transId === transaction.transId
	);
	for (let i=0; i<transRecords.length; i++) {
		var index = $shop.cache.transHistory.indexOf(
			record => record.transId === transaction.transId
		);
		$shop.cache.transHistory.splice(index, 1);
	}
	const $tw = get$tw($shop.wikis.trans);
	$tw.wiki.addTiddler(new $tw.Tiddler(
		$tw.wiki.getCreationFields(),
		$tw.wiki.getModificationFields(),
		{
			title: `shop-trans-record-${transaction.transId}`,
			tags: '$:/pocket-io/shop/record/trans trans record',
			type: 'application/json',
			text: JSON.stringify(transRecords, null, 2)
		}
	))
	$refreshClients($shop.wikis.trans);
	return Object.assign({}, transaction);
}
