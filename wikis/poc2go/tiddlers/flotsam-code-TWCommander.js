$tpi.fn.Commander = function Commander(tw) {
	this.checkForErrors = (err) => {
		if (err) {
			tw.utils.log("Error: " + err,'red');
		}
	}
	this.execute = (cmds) => {
		new tw.Commander(cmds, this.checkForErrors, tw.wiki,
			{output: process.stdout, error: process.stderr})
		.execute();
	}
}

$tpi.poc2goCmdr = new Commander(get$tw('poc2go'));
