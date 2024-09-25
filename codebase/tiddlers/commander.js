function Commander(tw) {
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
cwCmdr = new Commander($cw);
dwCmdr = new Commander($dw);
twCmdr = new Commander($tw);
