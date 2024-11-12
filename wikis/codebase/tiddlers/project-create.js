// Create a project with a 'helpers' function
function projectCreate(project) {
	var fnName = 'helpers';
	if ($cw.wiki.tiddlerExists(`${project}`)) {
		return `Project '${project}' already exists in $code wiki.\n`;
	}
	if ($cw.wiki.tiddlerExists(`${project}-${fnName}`)) {
		return `Function '${project}-${fnName}' already exists in $code wiki.\n`;
	}
	return projectUpdate(project, fnName);
}
