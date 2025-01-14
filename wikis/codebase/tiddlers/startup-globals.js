// These are all assigned to REPL global context

// External packages
// Minify code
const UglifyJS = require('uglify-js');

// Helpers
// Copy a JS object
// Get last 12 digits of socket ID
const cpy = (obj) => JSON.parse(JSON.stringify(obj));
const sid = (socket) => socket.id.split('-').pop();

// $ss is shorthand for 'serverSettings'
const get$wikiNames = $ss.map(settings => settings.name);
const get$settings = (name) => $ss.find(settings => settings.name === name) ?? {};
const get$tw = (name) => get$settings(name).$tw;
const get$proxy = (name) => get$settings(name).proxy ?? {};
const get$server = (name) => get$proxy(name).server ?? {};
const get$router = (name) => get$server(name).router ?? {};
const get$pocketio = (name) => get$server(name).pocketio ?? {};

const tStamp = () => {
	return ((new Date()).toLocaleDateString(undefined, {
		hourCycle: 'h23',
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit' //, second: '2-digit'
		})).replace(',', '') + ' ';
}
