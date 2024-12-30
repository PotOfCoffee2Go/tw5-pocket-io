// REPL Commands
(function () {
const commander = require('commander');
const { Command, Option } = require('commander');
const program = new Command();
$tpi.program = program; // assign for global access

// Do not 'process.exit()' on errors
//  (you need to place $tpi.program.parse(...) in a try/catch instead)
program.exitOverride();

// cmd.run('help')
cmd.run = function(commandStr) {
	var commands = ('node placeholder ' + commandStr).split(' ');
	commands[1] = '-'; // replace the placeholder with a dash
	try {
		$tpi.program.parse(commands);
	} catch (err) {} // do not process.exit()
}

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

})()
