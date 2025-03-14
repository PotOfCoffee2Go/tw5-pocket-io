// AsyncQueue
// usage:
/*

var q = new $AsyncQueue;

function repeatTask() {
	q.awaitQueue()
	.then(obj => {
	  q.request = null;
		console.log(obj);
		// ...do something with object ...
		repeatTask();
	})
}

repeatTask();

// add to queue
q.enQueue({a: 'object'});
*/

function $AsyncQueue() {
	this.queue = [];
	this.request = null;
	
	this.awaitQueue = () => {
		return new Promise((resolve) => {
			var msg = this.queue.shift();
			if (msg) { resolve(msg); }
			else { this.request = resolve; }
		})
	}

	this.enQueue = (msg) => {
		var resolve = this.request;
		if (resolve) { resolve(msg); }
		else { this.queue.push(msg); }
	}
}

const $nrInMsg = new $AsyncQueue;
const $nrOutMsg = new $AsyncQueue;
