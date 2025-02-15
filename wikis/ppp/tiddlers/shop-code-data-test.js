var uuid = () => crypto.randomUUID().split('-').pop();

var items = [
	{itemId: uuid(), name: 'bike', price: 400, qty: 1},
	{itemId: uuid(), name: 'crackers', price: 3.50, qty: 1},
	{itemId: uuid(), name: 'laptop', price: 1200, qty: 1}
]

var guestUser = {
	userId: uuid(),
	name: 'Guest',
	active: true,
	taxRate: .03,
	cart: [],
	purchases: []
}


