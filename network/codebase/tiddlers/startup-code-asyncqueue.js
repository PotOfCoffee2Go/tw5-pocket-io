// AsyncQueue
// A single reader - multiple writer FIFO async queue
//  Note! only works for a single reader
// usage:
/*
// Reader
var q = new $AsyncQueue;

function repeatTask() {
	q.awaitQueue()
	.then(obj => {
	  q.request = null; // important!
		// ...do something with object - like ...
		console.dir(obj);
		 // wait for next object
		repeatTask();
	})
}
// Start reading from queue
repeatTask();

//  ----------------------
//  Writers - add to queue
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
