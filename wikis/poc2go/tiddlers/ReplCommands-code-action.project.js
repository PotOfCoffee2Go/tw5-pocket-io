(function () {

$tpi.repl.program
	.command('project')
	.usage('[project-name] [options]')
	.description('display a code project')
	.argument('[project-name]')
	.option('-i, --interactive', 'page thru project code tiddlers')
	.option('-s, --script <script-title>', 'script to display')
	.option('-w, --writeup', 'display writeup of script')
	.action((project, options, command) => {
		if (!project) {
			$rt.write(`cmd.man('')\n`);
			return;
		}
		if (options.interactive) {
			$rt.write(`cmd.man('${project}')\n`);
			return;
		}
		hog('not -i',9);
	});

})()
