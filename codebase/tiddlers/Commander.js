var commander = {
  checkForErrors: (err) => {
    if (err) {
      $dw.utils.error("Error: " + err);
    }
  },
  execute: (cmds) => {
    new $dw.Commander(cmds, commander.checkForErrors, $data,
      {output: process.stdout, error: process.stderr})
    .execute();
  }
}
