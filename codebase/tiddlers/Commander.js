const commander = {
  checkForErrors: (err) => {
    if (err) {
      $tw.utils.error("Error: " + err);
    }
  },
  execute: (wiki, cmds) => {
    new $tw.Commander(cmds, commander.checkForErrors, wiki,
      {output: process.stdout, error: process.stderr})
    .execute();
  }
}
