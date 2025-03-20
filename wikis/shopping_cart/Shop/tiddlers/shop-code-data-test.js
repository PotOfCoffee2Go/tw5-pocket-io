var uuid = () => crypto.randomUUID().split('-').pop();

var items = [
	{itemId: '0742845f3c4e', name: 'bike', price: 400, qty: 1},
	{itemId: '59663ccac360', name: 'crackers', price: 3.50, qty: 1},
	{itemId: 'f014a0cabb14', name: 'laptop', price: 1200, qty: 1}
]

var guestUser = {
	userId: '006dc553bbf5',
	name: 'Guest',
	active: true,
	taxRate: .03,
	cart: [],
	purchases: []
}


