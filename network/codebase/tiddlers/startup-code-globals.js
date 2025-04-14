// These are all assigned to REPL context

// External packages
// Minify code
const UglifyJS = require('uglify-js');

// Helpers
// Copy a JS object
// Get last 12 digits of socket ID
// Generate a random id
$rt.context.cpy = (obj) => JSON.parse(JSON.stringify(obj));
$rt.context.sid = (socket) => socket.id.split('-').pop();
$rt.context.uid = () => crypto.randomUUID().split('-').pop();

// Hack of Node-Red utilLog()
$rt.context.tStamp = function (msg) {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const d = new Date();
	const time = [
		d.getHours().toString().padStart(2, '0'),
		d.getMinutes().toString().padStart(2, '0'),
		d.getSeconds().toString().padStart(2, '0')
	].join(':');
	return `${d.getDate()} ${months[d.getMonth()]} ${time} `;
//	return `${time} `;
}

/*
$rt.context.ttStamp = () => {
	return ((new Date()).toLocaleDateString(undefined, {
		hourCycle: 'h23',
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit', second: '2-digit'
		})).replace(',', '') + ' ';
}
*/
