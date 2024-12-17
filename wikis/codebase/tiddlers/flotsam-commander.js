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

$tpi.dsCmdr = new Commander($ds);
$tpi.cwCmdr = new Commander($cw);
$tpi.dwCmdr = new Commander($dw);
$tpi.rwCmdr = new Commander($rw);
