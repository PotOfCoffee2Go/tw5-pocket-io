const $AdminApi = function () {
	var self = this;

	this.url = $nr.settings.link.admin;

	this.getHeaders = {
		'User-Agent': 'tw5-node-red',
		'Node-RED-API-Version' : 'v2',
		'Accept': 'application/json',
	}

	this.updateHeaders = {
		'User-Agent': 'tw5-node-red',
		'Content-Type': 'application/json',
		'Node-RED-API-Version' : 'v2',
		'Accept': 'application/json',
	}

	const adminGet = function (endpoint, method = 'GET') {
		if (endpoint[0] !== '/') { endpoint = '/' + endpoint; }
		return new Promise((resolve, reject) => {
			fetch(self.url + endpoint, {
				method: method,
				headers: self.getHeaders,
			})
			.then(res => res.json())
			.then(data => { resolve(data) })
			.catch(err => { reject(err) });
		})
	}

	const adminPost = function (endpoint, body, method = 'POST') {
		if (endpoint[0] !== '/') { endpoint = '/' + endpoint; }
		return new Promise((resolve, reject) => {
			fetch(self.url + endpoint, {
				method: method,
				headers: self.updateHeaders,
				body: JSON.stringify(body),
			})
			.then(res => res.json())
			.then(data => { resolve(data) })
			.catch(err => { reject(err) });
		})
	}

	this.get = function (endpoint) {
		return adminGet(endpoint, 'GET');
	}
	this.post = function (endpoint, body) {
		return adminPost(endpoint, body, 'POST');
	}
	this.put = function (endpoint, body) {
		return adminPost(endpoint, body, 'PUT');
	}
	this.delete = function (endpoint) {
		return adminGet(endpoint, 'DELETE');
	}

	this.getFlows = function() {
		return adminGet('/flows', 'GET');
	}

	this.getByProperty = function(property, value) {
		return new Promise((resolve, reject) => {
			this.getFlows()
			.then(data => {
				var nodes = data.flows.filter(node => node[property] === value);
				resolve(nodes);
			})
			.catch(err => { reject(err) });
		})
	}

	this.getTabs = function() {
		return this.getByProperty('type', 'tab');
	}

	this.getFlowById = function(id) {
		return adminGet(`/flow/${id}`, 'GET');
	}

	this.getNodes = function() {
		return adminGet('/nodes', 'GET');
	}

}
