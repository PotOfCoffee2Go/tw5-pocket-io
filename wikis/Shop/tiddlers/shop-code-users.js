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
