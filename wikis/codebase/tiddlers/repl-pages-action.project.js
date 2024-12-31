$tpi.repl.action.project = function(project, options, command) {
	if (!project) {
		$rt.write(`cmd.man('')\n`);
		return;
	}
	if (options.interactive) {
		$rt.write(`cmd.man('${project}')\n`);
		return;
	}
	hog('not -i',9);
}