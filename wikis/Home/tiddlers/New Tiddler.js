// Older versions of Node-RED used the deprecated util.log function.
// With Node.js 22, use of that function causes warnings. So here we
// are replicating the same format output to ensure we don't break any
// log parsing that happens in the real world.
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const utilLog = function (msg) {
    const d = new Date();
    const time = [
        d.getHours().toString().padStart(2, '0'),
        d.getMinutes().toString().padStart(2, '0'),
        d.getSeconds().toString().padStart(2, '0')
    ].join(':');
    console.log(`${d.getDate()} ${months[d.getMonth()]} ${time} - ${msg}`)
}
