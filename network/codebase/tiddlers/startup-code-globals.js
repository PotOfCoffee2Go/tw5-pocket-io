// These are all assigned to REPL global context

// External packages
// Minify code
const UglifyJS = require('uglify-js');

// Helpers
// Copy a JS object
// Get last 12 digits of socket ID
// Generate a random id
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const sid = (socket) => socket.id.split('-').pop();
const uid = () => crypto.randomUUID().split('-').pop();

// Hack of Node-Red utilLog()
const tStamp = function (msg) {
	// const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const d = new Date();
	const time = [
		d.getHours().toString().padStart(2, '0'),
		d.getMinutes().toString().padStart(2, '0'),
		d.getSeconds().toString().padStart(2, '0')
	].join(':');
//	return `${d.getDate()} ${months[d.getMonth()]} ${time} `;
	return `${time} `;
}

const ttStamp = () => {
	return ((new Date()).toLocaleDateString(undefined, {
		hourCycle: 'h23',
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit', second: '2-digit'
		})).replace(',', '') + ' ';
}
