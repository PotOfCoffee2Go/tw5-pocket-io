const $AdminApi = function () {
	var self = this;
	this.url = $nr.settings.link.admin;
	
	this.getHeaders = {
		'User-Agent': 'tw5-node-red',
		'Node-RED-API-Version' : 'v2',
		'Accept': 'application/json',
	}
	this.postHeaders = {
		'User-Agent': 'tw5-node-red',
		'Content-Type': 'application/json',
		'Node-RED-API-Version' : 'v2',
		'Accept': 'application/json',
	}

	// GET & DELETE methods
	const adminGet = function (endpoint, method = 'GET') {
		if (endpoint[0] !== '/') { endpoint = '/' + endpoint; }
		return new Promise((resolve, reject) => {
			fetch(self.url + endpoint, {
				method: method,
				headers: self.getHeaders,
			})
			.then((res) => {
				if (res.status !== 200) {
					throw new Error(`Unable to ${method} Node-Red '${endpoint}' - HTTP status: ${res.status}`);
				}
				return res.json();
			})
			.then(data => { resolve(data) })
			.catch(err => { reject(err) });
		})
	}

	// POST & PUT methods
	const adminPost = function (endpoint, body, method = 'POST') {
		if (endpoint[0] !== '/') { endpoint = '/' + endpoint; }
		return new Promise((resolve, reject) => {
			fetch(self.url + endpoint, {
				method: method,
				headers: self.postHeaders,
				body: JSON.stringify(body),
			})
			.then((res) => {
				if (res.status !== 200) {
					throw new Error(`Unable to ${method} Node-Red '${endpoint}' - HTTP status: ${res.status}`);
				}
				return res.json();
			})
			.then(data => { resolve(data) })
			.catch(err => { reject(err) });
		})
	}

	// Lower-level fetches
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

	this.login = function (username, password) {
		return new Promise((resolve, reject) => {
			adminGet('/auth/login')
			.then(data => {
				if (Object.keys(data).length === 0) {
					resolve(data);
				} else {
					this.getToken(username, password)
					.then(tokenInfo => {
						resolve(tokenInfo);
					})
				}
			})
			.catch(err => { reject(err) });
		})
	}

	// Fetch access token and add to headers
	this.getToken = function (username, password, scope = '*') {
		return new Promise((resolve, reject) => {
			adminPost('/auth/token', {
				client_id: 'node-red-admin',
				grant_type: 'password',
				scope: scope,
				username: username,
				password: password,
			})
			.then(tokenInfo => {
				if (Object.keys(tokenInfo).length > 0) {
					this.getHeaders['Authorization'] = `${tokenInfo.token_type} ${tokenInfo.access_token}`;
					this.postHeaders['Authorization'] = `${tokenInfo.token_type} ${tokenInfo.access_token}`;
				}
				resolve(tokenInfo);
			})
			.catch(err => { reject(err) });
		})
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
