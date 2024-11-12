// Delete a project's function or a project completely
function projectDelete(project, fnName) {
	if (!(project && fnName)) {
		return 'A project and function name are required!\n' +
			'deleteProjectTiddlers(project, fnName)\n' +
			`use deleteProjectTiddlers(project, '!!!delete all!!!') to remove project.`
	}
	var filter, action;
	if (fnName === '!!!delete all!!!') {
		filter = `[tag[${project}]][[$:/poc2go/${project}-inline-template]]`;
		action = `Delete project '${project}'.`;
	} else {
		if (!$cw.wiki.tiddlerExists(`${project}-${fnName}`)) {
			return `Function '${project}-${fnName}' does not exist in $code wiki.\n`;
		}
		filter = `[prefix[${project}-${fnName}]]`;
		action = `Delete function '${project}-${fnName}'.`;
	}

	var tidDeleted = [];
	$cw.wiki.filterTiddlers(filter).forEach(title => {
		$cw.wiki.deleteTiddler(title);
		tidDeleted.push(`  ${title}`);
	})

	var result = `${action}\nTiddlers deleted from $code wiki:\n` +
		`${tidDeleted.join('\n')}\n`;
	log(hue(result, 149));
	return result;
}
