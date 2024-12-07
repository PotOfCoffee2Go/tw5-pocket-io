$tpi.fn.hideStdout = function hideStdout() {
	var old_stdout_write = process.stdout.write;

	process.stdout.write = (function (write) {
		return (string, encoding, fd) => {
			var args = Object.values(arguments);
			args[0] = '';
			write.apply(process.stdout, args);
		};
	}(process.stdout.write));

	// puts back to original
	$tpi.fn.showStdout = function showStdout() {
		process.stdout.write = old_stdout_write;
	};
};
