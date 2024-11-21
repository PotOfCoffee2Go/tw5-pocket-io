var led = 25;
pinMode(led, OUTPUT);
var interval = undefined;

// this is a comment
function blinky(ms = 1000) {
 if (interval) { clearInterval(interval) }
 interval = setInterval(() => {
   digitalToggle(led);
   let msg = { title: 'blinky', text: 'again...', interval };
  console.log(JSON.stringify(msg));
 }, ms);
 return `LED blinking every ${ms} milliseconds`
}

blinky();
