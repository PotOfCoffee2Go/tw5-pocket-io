// REPL Commands
(function () {
const commander = require('commander');
const { Command, Option } = commander;

const program = new Command();
$tpi.repl.program = program; // assign for global access
$tpi.repl.action = $tpi.repl.action ?? {};
 
// Do not 'process.exit()' on errors
//  (place $tpi.repl.program.parse(...) in a try/catch instead)
program.exitOverride();

// Run a command - ex: cmd.run('help')
cmd.run = function(commandStr) {
	var commands = ('node placeholder ' + commandStr).split(' ');
	commands[1] = '-'; // replace the placeholder with a dash
	try {
		$tpi.repl.program.parse(commands);
	} catch (err) {} // do not process.exit()
}

// Set color of help text
program.configureHelp({
  styleTitle: (str) => hue(str, 158),
  styleCommandText: (str) => hue(str, 158),
  styleCommandDescription: (str) => hue(str, 158),
  styleDescriptionText: (str) => hue(str, 158),
  styleOptionText: (str) => hue(str, 158),
  styleArgumentText: (str) => hue(str, 158),
  styleSubcommandText: (str) => hue(str, 158),
});

program
	.command('clone <source> [destination]')
	.description('clone a repository into a newly created directory')
	.action((source, destination) => {
		console.log('clone command called');
	});

program
	.command('serve')
	.description('launch web server')
	.addArgument(new commander.Argument('<wiki-name>', 'wiki to serve')
		.choices(['dash', 'code', 'data'])
	)
	.requiredOption('-p,--port <port_number>', 'web port')
	.action((wiki_name,options) => {
		hog(`${wiki_name} server on port ${options.port}`,40);
	});

program
	.command('project')
	.usage('[project-name] [options]')
	.description('display a code project')
	.argument('[project-name]')
	.option('-i, --interactive', 'page thru project code tiddlers')
	.option('-s, --script <script-title>', 'script to display')
	.option('-w, --writeup', 'display writeup of script')
	.action((project, options, command) => {
		$tpi.repl.action.project(project, options, command);
	});

})()
