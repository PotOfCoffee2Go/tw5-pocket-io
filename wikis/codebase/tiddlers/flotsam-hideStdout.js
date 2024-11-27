// Idea Borrowed.
// https://github.com/sfarthin/intercept-stdout/tree/master
// which borrowed Gist.
// https://gist.github.com/benbuckman/2758563
// usage:
//   var showStdout = hideStdout();
//     will hide text being displayed on console terminal
//   showStdout();
//     will show stdout text on console
function hideStdout() {
	var old_stdout_write = process.stdout.write;

	process.stdout.write = (function (write) {
		return (string, encoding, fd) => {
			var args = Object.values(arguments);
			args[0] = '';
			write.apply(process.stdout, args);
		};
	}(process.stdout.write));

	// puts back to original
	return function showStdout() {
		process.stdout.write = old_stdout_write;
	};
};
